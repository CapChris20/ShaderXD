import { defineShader } from './common'

export default defineShader({
  id: 'particle-swarm',
  name: 'Particle Swarm',
  category: 'Particles',
  description: 'A flock orbiting a drifting attractor, with comet trails. Hold and drag to pull it.',
  bloom: { threshold: 0.35, intensity: 0.7, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;  // min=0 max=3 step=0.05 default=0.8 label="Speed"
uniform float u_count;  // min=10 max=72 step=1 default=56 label="Particles"
uniform float u_size;   // min=0.3 max=3 step=0.05 default=1.0 label="Size"
uniform vec3 u_color;   // color default=#f97316 label="Color A"
uniform vec3 u_color2;  // color default=#ff6b9d label="Color B"
uniform float u_glow;   // min=0 max=3 step=0.05 default=1.2 label="Glow"
uniform bool u_trails;  // default=true label="Trails"

void main() {
  vec2 p = screenUv();
  float t = u_travel;
  vec2 c = vec2(sin(t * 0.5) * 0.35, cos(t * 0.37) * 0.25) + u_look * 0.8;
  vec3 col = vec3(0.012, 0.006, 0.008);

  for (int i = 0; i < 72; i++) {
    float s = float(i);
    if (s >= u_count) break;
    float h1 = hash21(vec2(s, 1.3));
    float h2 = hash21(vec2(s, 7.1));
    vec3 tint = pal2(h1, u_color, u_color2);
    for (int k = 0; k < 4; k++) {
      if (k > 0 && !u_trails) break;
      float tt = t - float(k) * 0.05;
      float ang = s * 2.399 + tt * (0.3 + h2 * 1.1);
      float rad = (0.2 + 0.85 * h1) * (0.8 + 0.25 * sin(tt * 0.9 + s));
      vec2 q = c + rad * vec2(cos(ang), 0.7 * sin(ang + h2 * 3.0));
      float d = length(p - q);
      float a = u_size * 0.0004 / (d * d + 0.0004) * (1.0 - float(k) * 0.28);
      col += tint * a * 0.9;
    }
  }
  col += mix(u_color, u_color2, 0.4) * exp(-length(p - c) * 3.0) * 0.12 * u_glow;
  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
