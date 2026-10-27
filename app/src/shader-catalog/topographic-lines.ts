import { defineShader } from './common'

export default defineShader({
  id: 'topographic-lines',
  name: 'Topographic Lines',
  category: 'Landscape',
  description: 'Contour lines of a slowly shifting height field, with bold index contours. Drag to pan.',
  bloom: { threshold: 0.6, intensity: 0.3, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;      // min=0 max=3 step=0.05 default=0.6 label="Speed"
uniform float u_lines;      // min=6 max=60 step=1 default=28 label="Contours"
uniform float u_thickness;  // min=0.5 max=3 step=0.05 default=1.2 label="Line weight"
uniform float u_scale;      // min=0.5 max=4 step=0.05 default=1.4 label="Scale"
uniform vec3 u_color;       // color default=#ff6b9d label="Line"
uniform vec3 u_color2;      // color default=#ffd0e0 label="Index line"
uniform float u_glow;       // min=0 max=3 step=0.05 default=1.0 label="Glow"
uniform bool u_fill;        // default=true label="Tint bands"

float height(vec2 p) {
  float t = u_travel * 0.08;
  vec2 q = p * u_scale + vec2(t, -t * 0.6);
  vec2 w = vec2(fbm(q + 3.1), fbm(q + 7.7));
  return fbm(q + (w - 0.5) * 1.2);
}

void main() {
  vec2 p = screenUv() + u_look * 1.5;
  float h = height(p);
  float v = h * u_lines;
  float fw = fwidth(v) + 1e-4;
  float d = abs(fract(v - 0.5) - 0.5) / fw;

  float th = u_thickness;
  float line = 1.0 - smoothstep(th * 0.5, th * 0.5 + 1.0, d);
  float idx = floor(v + 0.5);
  float isIndex = step(mod(idx, 5.0), 0.5);
  float lineI = 1.0 - smoothstep(th, th + 1.0, d);

  vec3 bg = u_fill ? pal2(h * 0.9 + 0.1, vec3(0.02, 0.012, 0.012), u_color * 0.35) : vec3(0.018, 0.01, 0.012);
  vec3 col = bg;
  col = mix(col, u_color * 1.1, line * (1.0 - isIndex));
  col = mix(col, u_color2 * 1.3, lineI * isIndex);
  col += u_color * exp(-d * 0.35) * 0.12 * u_glow;
  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
