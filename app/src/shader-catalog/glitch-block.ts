import { defineShader } from './common'

export default defineShader({
  id: 'glitch-block',
  name: 'Glitch Block',
  category: 'Glitch/Distortion',
  description: 'A neon skyline corrupted by tearing rows, block swaps and channel splits.',
  bloom: { threshold: 0.6, intensity: 0.4 },
  body: /* glsl */ `
uniform float u_speed;      // min=0 max=3 step=0.05 default=1.0 label="Speed"
uniform float u_intensity;  // min=0 max=2 step=0.05 default=1.0 label="Corruption"
uniform float u_split;      // min=0 max=1 step=0.01 default=0.4 label="Channel split"
uniform vec3 u_color;       // color default=#f97316 label="Sun"
uniform vec3 u_color2;      // color default=#06b6d4 label="Accent"
uniform bool u_scanlines;   // default=true label="Scanlines"
uniform bool u_blocks;      // default=true label="Block swaps"

vec3 scene(vec2 p) {
  vec3 col = mix(vec3(0.02, 0.01, 0.012), u_color2 * 0.22, smoothstep(0.6, -1.0, p.y));
  vec2 sp = p - vec2(0.0, 0.12);
  float sun = smoothstep(0.52, 0.5, length(sp));
  float gap = smoothstep(0.2, -0.5, sp.y) * 0.7;
  float sl = smoothstep(gap - 0.02, gap + 0.02, fract(sp.y * 7.0 - u_travel * 0.1));
  vec3 sunc = pal2(smoothstep(-0.5, 0.5, sp.y) * 0.5, u_color, u_color2);
  col = mix(col, sunc * 1.2, sun * mix(1.0, sl, step(sp.y, 0.1)));
  float bx = floor(p.x * 10.0);
  float bh = -0.55 + 0.35 * hash21(vec2(bx, 3.0));
  col = mix(col, vec3(0.008), step(p.y, bh));
  col += u_color2 * smoothstep(0.012, 0.0, abs(p.y + 0.6)) * 0.6;
  vec2 w = fract(vec2(p.x * 10.0, p.y * 20.0));
  col += u_color2 * 0.5 * step(p.y, bh) * step(-0.95, p.y) * step(0.7, hash21(floor(vec2(p.x * 10.0, p.y * 20.0)))) * step(0.3, w.x) * step(w.x, 0.7) * step(0.3, w.y) * step(w.y, 0.7);
  return col;
}

void main() {
  vec2 uv = vUv;
  float aspect = u_resolution.x / u_resolution.y;
  float tick = floor(u_time * 10.0);
  float k = u_intensity;

  float row = floor(uv.y * 28.0);
  float rr = hash21(vec2(row, tick));
  float off = step(1.0 - 0.12 * k, rr) * (hash21(vec2(row, tick + 9.0)) - 0.5) * 0.35 * k;
  if (u_blocks) {
    vec2 b = floor(uv * vec2(7.0, 9.0));
    float br = hash21(b + tick * 1.7);
    if (br > 1.0 - 0.06 * k) {
      uv.x += (hash21(b + 3.0) - 0.5) * 0.4;
      uv.y = fract(uv.y + hash21(b + 5.0) * 0.3);
    }
  }
  float split = u_split * 0.03 * (1.0 + 6.0 * abs(off) * k);
  vec2 p0 = (vec2(uv.x + off, uv.y) * 2.0 - 1.0) * vec2(aspect, 1.0) + u_look * 0.5;
  vec3 col;
  col.r = scene(p0 + vec2(split, 0.0)).r;
  col.g = scene(p0).g;
  col.b = scene(p0 - vec2(split, 0.0)).b;
  if (u_scanlines) col *= 0.88 + 0.12 * sin(vUv.y * u_resolution.y * 1.6);
  col *= 1.0 + 0.05 * sin(u_time * 40.0) * k;
  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
