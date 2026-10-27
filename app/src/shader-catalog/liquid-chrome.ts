import { defineShader } from './common'

export default defineShader({
  id: 'liquid-chrome',
  name: 'Liquid Chrome',
  category: 'Liquid',
  description: 'A slow, warped metal surface reflecting a studio of soft lights.',
  bloom: { threshold: 0.7, intensity: 0.35 },
  body: /* glsl */ `
uniform float u_speed;  // min=0 max=2 step=0.05 default=0.5 label="Speed"
uniform vec3 u_color;   // color default=#ff9ab8 label="Metal tint"
uniform float u_warp;   // min=0 max=2 step=0.05 default=1.0 label="Flow"
uniform float u_scale;  // min=0.5 max=3 step=0.05 default=1.4 label="Scale"
uniform float u_shine;  // min=0 max=2 step=0.05 default=1.0 label="Shine"

float height(vec2 p) {
  float t = u_travel * 0.35;
  vec2 q = p * u_scale;
  vec2 w = vec2(fbm(q + vec2(0.0, t)), fbm(q + vec2(5.2, 1.3) - t * 0.8));
  q += (w - 0.5) * 2.0 * u_warp;
  return fbm(q + t * 0.2);
}

// A small studio: warm sky, a bright horizon band and two softboxes.
vec3 env(vec3 r) {
  float up = r.y * 0.5 + 0.5;
  vec3 col = mix(vec3(0.02, 0.012, 0.01), u_color * 0.55, smoothstep(0.35, 0.95, up));
  col += u_color * exp(-pow((r.y + 0.05) * 7.0, 2.0)) * 0.8;
  col += vec3(1.0, 0.93, 0.82) * smoothstep(0.82, 0.9, dot(r, normalize(vec3(-0.45, 0.65, 0.6)))) * 3.0 * u_shine;
  col += u_color * smoothstep(0.9, 0.95, dot(r, normalize(vec3(0.6, 0.3, 0.7)))) * 2.0 * u_shine;
  return col;
}

void main() {
  vec2 uv = screenUv() * 0.9 + u_look * 0.4;
  float e = 0.004;
  float h = height(uv);
  float dx = height(uv + vec2(e, 0.0)) - h;
  float dy = height(uv + vec2(0.0, e)) - h;
  vec3 n = normalize(vec3(-dx / e * 0.32, -dy / e * 0.32, 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);

  float fres = pow(1.0 - n.z, 3.0);
  vec3 col = env(r) * (0.8 + 0.5 * fres);
  col *= 0.55 + 0.9 * h;                    // cavities read darker
  col += u_color * pow(max(n.z, 0.0), 40.0) * 0.12 * u_shine;

  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
