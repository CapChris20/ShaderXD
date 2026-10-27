// Shared GLSL header and helper that builds a ShaderDef from a fragment body.
// Flow: prepend header → parse uniforms from the final GLSL → return ShaderDef.
// Used by: every shader file under shaders/.

import { readUniforms } from '../read-uniforms/readUniforms'
import type { BloomSettings, ShaderDef } from './types'

/**
 * Prepended to every fragment shader.
 *   u_time        seconds since mount
 *   u_resolution  drawing-buffer size in pixels
 *   u_look        yaw/pitch offset in radians, driven by dragging with the button held
 *   u_travel      integral of u_speed over time, so changing the speed never makes the scene jump
 */
export const glslHeader = /* glsl */ `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_look;
uniform float u_travel;
varying vec2 vUv;

const float PI = 3.14159265;

// Cosine palette (Inigo Quilez): a + b * cos(2pi (c t + d))
vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}
// Cosine palette that swings smoothly between two colours as t goes 0 -> 1 -> 0.
vec3 pal2(float t, vec3 c1, vec3 c2) {
  return pal(t, 0.5 * (c1 + c2), 0.5 * (c1 - c2), vec3(0.5), vec3(0.0));
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

// Screen uv centred on 0, y in [-1, 1], x scaled by aspect.
vec2 screenUv() {
  return (vUv * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
}

// Final look: vignette, filmic shoulder (ACES fit), then to linear because the
// post-processing chain applies the sRGB curve once at the very end.
vec3 finish(vec3 col, float vignette) {
  vec2 q = vUv * 2.0 - 1.0;
  col = mix(vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), col, 1.3);
  col *= mix(1.0, smoothstep(1.55, 0.35, length(q * vec2(0.95, 1.1))), vignette);
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  return pow(clamp(col, 0.0, 1.0), vec3(2.2));
}
`

/**
 * Builds a ShaderDef; the controls always come from parsing the final GLSL.
 * Flow: 1. join header + body  2. parse uniforms  3. return the def
 */
export function defineShader(
  def: Omit<ShaderDef, 'fragment' | 'uniforms'> & { body: string; bloom: BloomSettings },
): ShaderDef {
  // 1. Join the shared header with this shader's body.
  const { body, ...rest } = def
  const fragment = glslHeader + body

  // 2. Parse controls from the finished GLSL so they cannot drift from the source.
  const uniforms = readUniforms(fragment)

  // 3. Return the full shader definition.
  return { ...rest, fragment, uniforms }
}
