import { defineShader } from './common'

export default defineShader({
  id: 'optic-tunnel',
  name: 'Optic Tunnel',
  category: 'Geometric',
  description: 'An endless twisting tunnel of glass panes with chromatic dispersion. Drag to shift the vanishing point.',
  bloom: { threshold: 0.45, intensity: 0.5, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;      // min=0 max=4 step=0.05 default=1.0 label="Speed"
uniform vec3 u_color;       // color default=#06b6d4 label="Edge color A"
uniform vec3 u_color2;      // color default=#f97316 label="Edge color B"
uniform float u_twist;      // min=-2 max=2 step=0.05 default=0.6 label="Twist"
uniform float u_dispersion; // min=0 max=1 step=0.01 default=0.3 label="Dispersion"
uniform float u_glow;       // min=0 max=3 step=0.05 default=1.2 label="Glow"
uniform bool u_panes;       // default=true label="Glass panes"

const float SECTORS = 10.0;
const float RING_FREQ = 3.0;

// Edge + pane mask for one colour channel; each channel samples a slightly different depth.
// Distances are converted to screen space so lines keep a constant width all the way down the tunnel.
float channel(float depth, float turns, float r, float shift) {
  float k = depth + shift;
  float a = turns * SECTORS + k * u_twist * 0.1;
  float fr = fract(k);
  float fa = fract(a);
  float dRing = min(fr, 1.0 - fr) * r * r / (0.45 * RING_FREQ);
  float dSpoke = min(fa, 1.0 - fa) * 6.28318 * r / SECTORS;
  float edge = max(smoothstep(0.006, 0.0, dRing), smoothstep(0.004, 0.0, dSpoke));
  float pane = u_panes ? 0.22 * mod(floor(k) + floor(a), 2.0) * (0.35 + 0.65 * smoothstep(0.0, 0.5, min(fr, 1.0 - fr))) : 0.0;
  return edge + pane;
}

void main() {
  vec2 p = screenUv() - u_look * 0.5 + 0.03 * vec2(sin(u_time * 0.3), cos(u_time * 0.23));
  float r = length(p);
  float turns = atan(p.y, p.x) / 6.28318;
  float depth = 0.45 * RING_FREQ / max(r, 0.001) + u_travel * 0.8;

  float s = u_dispersion * 0.035;
  vec3 mask = vec3(channel(depth, turns, r, s), channel(depth, turns, r, 0.0), channel(depth, turns, r, -s));
  vec3 tint = pal2(depth * 0.04, u_color, u_color2);
  // Dispersion without a rainbow: the shifted channels fringe in the two chosen colours.
  vec3 fringe = u_color * mask.b + u_color2 * mask.r + 0.45 * tint * mask.g;

  float fade = smoothstep(0.04, 0.35, r) * (0.45 + 0.55 * smoothstep(1.8, 0.3, r));
  vec3 col = fringe * fade * 1.1;
  col += mix(u_color2, u_color, 0.35) * exp(-r * 4.0) * 0.22 * u_glow;

  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
