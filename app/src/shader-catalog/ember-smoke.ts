import { defineShader } from './common'

export default defineShader({
  id: 'ember-smoke',
  name: 'Ember Smoke',
  category: 'Fire/Smoke',
  description: 'A domain-warped flame with smoke and rising embers.',
  bloom: { threshold: 0.5, intensity: 0.6, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;      // min=0 max=3 step=0.05 default=0.8 label="Speed"
uniform vec3 u_color;       // color default=#f97316 label="Flame color"
uniform float u_intensity;  // min=0.2 max=2.5 step=0.05 default=1.3 label="Intensity"
uniform float u_turbulence; // min=0 max=2 step=0.05 default=1.0 label="Turbulence"
uniform float u_glow;       // min=0 max=3 step=0.05 default=1.0 label="Glow"
uniform bool u_embers;      // default=true label="Embers"

void main() {
  vec2 uv = screenUv();
  vec2 p = vec2(uv.x * 1.1, uv.y * 0.9 - u_travel * 0.5);

  // Domain warp: sample noise at coordinates bent by more noise.
  vec2 q = vec2(fbm(p * 2.0 + vec2(3.1, u_time * 0.04)), fbm(p * 2.0 + vec2(7.7, 1.9)));
  vec2 pw = p + (q - 0.5) * 1.1 * u_turbulence;
  float n = fbm(pw * 2.2);

  // Flame body: tallest and brightest at the bottom centre.
  float shape = smoothstep(1.0, -0.9, uv.y) * smoothstep(1.6, 0.0, abs(uv.x) * (0.8 + 0.8 * (uv.y + 1.0)));
  float heat = clamp((n - 0.3) * 2.8 * shape * u_intensity + shape * 0.22, 0.0, 2.0);

  vec3 hot = vec3(1.0, 0.84, 0.5);
  vec3 col = pal2(smoothstep(0.05, 0.75, heat) * 0.5, vec3(0.018, 0.007, 0.01), u_color);
  col = mix(col, pal2(smoothstep(0.7, 1.4, heat) * 0.5, u_color, hot), smoothstep(0.7, 1.0, heat));

  // Smoke above the flame, lit warm from below.
  float smoke = fbm(pw * 1.3 + vec2(0.0, 4.0)) * smoothstep(-0.3, 0.7, uv.y) * smoothstep(1.3, 0.2, abs(uv.x));
  col += vec3(0.30, 0.15, 0.10) * smoke * 0.22 * (0.6 + 0.4 * u_glow);
  col += u_color * heat * heat * 0.18 * u_glow;

  if (u_embers) {
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      vec2 g = uv * vec2(7.0 + fi * 3.0, 5.0 + fi * 2.5);
      g.y -= u_travel * (0.9 + 0.4 * fi) + fi * 7.0;
      vec2 id = floor(g);
      vec2 f = fract(g) - 0.5;
      float h = hash21(id + fi * 13.0);
      vec2 off = (vec2(hash21(id + 7.0), hash21(id + 11.0)) - 0.5) * 0.6;
      off.x += sin(u_time * 2.0 + h * 6.28) * 0.1;
      float spark = smoothstep(0.07, 0.0, length(f - off)) * step(0.78, h) * (0.5 + 0.5 * sin(u_time * 5.0 + h * 40.0));
      col += hot * spark * 1.6 * exp(-max(uv.y + 0.4, 0.0) * 0.9);
    }
  }

  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
