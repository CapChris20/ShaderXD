import { defineShader } from './common'

export default defineShader({
  id: 'halftone-dots',
  name: 'Halftone Dots',
  category: 'Geometric',
  description: 'A lit sphere and rolling wave printed as two offset-screen ink layers.',
  bloom: { threshold: 0.85, intensity: 0.2 },
  body: /* glsl */ `
uniform float u_speed;       // min=0 max=2 step=0.05 default=0.6 label="Speed"
uniform float u_density;     // min=20 max=140 step=1 default=64 label="Dots"
uniform float u_angle;       // min=0 max=90 step=1 default=25 label="Screen angle"
uniform float u_contrast;    // min=0.5 max=2 step=0.05 default=1.2 label="Contrast"
uniform vec3 u_color;        // color default=#ff6b9d label="Ink 1"
uniform vec3 u_color2;       // color default=#f97316 label="Ink 2"
uniform vec3 u_paper_color;  // color default=#f5f2fa label="Paper"
uniform bool u_dark;         // default=false label="Glow on black"

float field(vec2 p, float t) {
  vec2 c = vec2(sin(t * 0.5) * 0.3, cos(t * 0.4) * 0.2);
  float r = length(p - c);
  float sphere = sqrt(max(0.0, 1.0 - (r / 0.55) * (r / 0.55)));
  vec3 n = vec3((p - c) / 0.55, sphere);
  float l = clamp(dot(n, normalize(vec3(-0.5, 0.6, 0.6))), 0.0, 1.0) * step(r, 0.55);
  float w = 0.5 + 0.5 * sin(p.x * 3.0 + sin(p.y * 2.5 + t) * 1.5 - t * 0.8);
  return clamp(max(l, w * 0.55 * smoothstep(0.3, 1.2, r)), 0.0, 1.0);
}

float dots(vec2 uv, float ang, float t, float bias) {
  vec2 g = rot(ang) * uv * u_density;
  vec2 cell = floor(g) + 0.5;
  vec2 f = g - cell;
  vec2 cuv = rot(-ang) * (cell / u_density);
  float lum = clamp((field(cuv, t) + bias) * u_contrast, 0.0, 1.0);
  float r = sqrt(lum) * 0.72;
  float aa = u_density * 1.5 / u_resolution.y;
  return smoothstep(r + aa, r - aa, length(f));
}

void main() {
  vec2 uv = screenUv() + u_look * 0.3;
  float a = radians(u_angle);
  float d1 = dots(uv, a, u_travel, 0.0);
  float d2 = dots(uv, a + 1.309, u_travel * 0.9 + 3.0, -0.1);
  vec3 col;
  if (u_dark) {
    col = vec3(0.03, 0.015, 0.015) + u_color * d1 * 1.2 + u_color2 * d2;
  } else {
    col = u_paper_color;
    col *= mix(vec3(1.0), u_color, d1);
    col *= mix(vec3(1.0), u_color2, d2);
  }
  gl_FragColor = vec4(finish(col, 0.5), 1.0);
}
`,
})
