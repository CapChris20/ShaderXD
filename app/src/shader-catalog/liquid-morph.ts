import { defineShader } from './common'

export default defineShader({
  id: 'liquid-morph',
  name: 'Liquid Morph',
  category: 'Liquid',
  description: 'One glossy form that melts between circle, star and blob.',
  bloom: { threshold: 0.6, intensity: 0.5, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;  // min=0 max=3 step=0.05 default=0.7 label="Speed"
uniform vec3 u_color;   // color default=#f97316 label="Color A"
uniform vec3 u_color2;  // color default=#ff6b9d label="Color B"
uniform float u_morph;  // min=0 max=1 step=0.01 default=0.7 label="Morph"
uniform float u_glow;   // min=0 max=3 step=0.05 default=1.2 label="Glow"
uniform bool u_rings;   // default=true label="Echo rings"

float shape(vec2 p, float t) {
  float a = atan(p.y, p.x);
  float k = 0.5 + 0.5 * sin(t * 0.5);
  float star = 0.58 + 0.2 * cos(5.0 * a + t * 0.8);
  float blob = 0.6 + 0.14 * sin(3.0 * a + t) + 0.1 * sin(2.0 * a - t * 1.3) + 0.05 * sin(7.0 * a + t * 1.7);
  return length(p) - mix(0.6, mix(blob, star, k), u_morph);
}

void main() {
  vec2 p = screenUv() + u_look * 0.35;
  float t = u_travel;
  float d = shape(p, t);
  float depth = clamp(-d / 0.45, 0.0, 1.0);

  vec2 e = vec2(0.004, 0.0);
  vec2 g = vec2(shape(p + e.xy, t) - shape(p - e.xy, t), shape(p + e.yx, t) - shape(p - e.yx, t)) / (2.0 * e.x);
  vec3 n = normalize(vec3(g * (1.0 - depth), 0.25 + depth * 1.2));
  vec3 L = normalize(vec3(-0.5, 0.6, 0.7));
  float diff = dot(n, L) * 0.5 + 0.5;
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 36.0);

  vec3 base = pal2(clamp(depth * 2.2 + 0.15 * sin(t * 0.7 + length(p) * 3.0), 0.0, 1.0) * 0.5, u_color2, u_color);
  vec3 body = base * (0.3 + 0.9 * diff) + spec * 0.9 + u_color2 * pow(1.0 - n.z, 2.0) * 0.5;

  float inside = smoothstep(0.006, -0.006, d);
  float outer = max(d, 0.0);
  vec3 bg = vec3(0.022, 0.009, 0.011) + u_color * exp(-outer * 5.0) * 0.28 * u_glow;
  if (u_rings) {
    float band = 0.5 + 0.5 * sin(outer * 24.0 - t * 2.0);
    bg += u_color * pow(band, 14.0) * exp(-outer * 3.5) * 0.4 * step(0.0, d);
  }
  gl_FragColor = vec4(finish(mix(bg, body, inside), 1.0), 1.0);
}
`,
})
