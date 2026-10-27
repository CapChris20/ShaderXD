import { defineShader } from './common'

export default defineShader({
  id: 'metaballs',
  name: 'Metaballs',
  category: 'Liquid',
  description: 'Orbiting blobs that merge like mercury. Drag to bend the field.',
  bloom: { threshold: 0.65, intensity: 0.4, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;   // min=0 max=3 step=0.05 default=0.7 label="Speed"
uniform float u_count;   // min=3 max=10 step=1 default=8 label="Blobs"
uniform float u_size;    // min=0.5 max=2 step=0.05 default=1.0 label="Size"
uniform float u_goo;     // min=0.3 max=3 step=0.05 default=1.0 label="Gooeyness"
uniform vec3 u_color;    // color default=#f97316 label="Color A"
uniform vec3 u_color2;   // color default=#ff6b9d label="Color B"
uniform float u_glow;    // min=0 max=3 step=0.05 default=1.0 label="Glow"
uniform bool u_outline;  // default=true label="Outline"

float field(vec2 p) {
  float F = 0.0;
  float t = u_travel;
  for (int i = 0; i < 10; i++) {
    float s = float(i);
    if (s >= u_count) break;
    vec2 c = vec2(sin(t * (0.3 + 0.13 * s) + s * 1.7), cos(t * (0.27 + 0.11 * s) + s * 2.3)) * vec2(0.85, 0.55);
    float r = (0.13 + 0.07 * hash21(vec2(s, 2.0))) * u_size;
    F += r * r / (dot(p - c, p - c) + 0.0004);
  }
  return F;
}

void main() {
  vec2 p = screenUv() + u_look * 0.4;
  float F = field(p);
  vec2 e = vec2(0.004, 0.0);
  vec2 g = vec2(field(p + e.xy) - field(p - e.xy), field(p + e.yx) - field(p - e.yx)) / (2.0 * e.x);

  float w = 0.03 * u_goo;
  float body = smoothstep(1.0 - w, 1.0 + w, F);
  vec3 n = normalize(vec3(-g / (F + 0.6) * 0.09, 1.0));
  vec3 L = normalize(vec3(-0.5, 0.6, 0.7));
  float diff = dot(n, L) * 0.5 + 0.5;
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0);

  vec3 base = pal2(clamp(F * 0.06, 0.0, 0.5), u_color, u_color2);
  vec3 blob = base * (0.35 + 0.8 * diff) + spec * 0.8;
  vec3 bg = vec3(0.02, 0.008, 0.01) + u_color * pow(clamp(F, 0.0, 1.0), 3.0) * 0.45 * u_glow;
  vec3 col = mix(bg, blob, body);
  if (u_outline) col += u_color2 * smoothstep(0.06, 0.0, abs(F - 1.0)) * 0.5;
  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
