import { defineShader } from './common'

export default defineShader({
  id: 'dither-wave',
  name: 'Dither Wave',
  category: 'Glitch/Distortion',
  description: 'Interfering ripples quantised through an ordered Bayer dither. Two inks, no gradients.',
  bloom: { threshold: 0.8, intensity: 0.25 },
  body: /* glsl */ `
uniform float u_speed;    // min=0 max=2 step=0.05 default=0.5 label="Speed"
uniform float u_pixel;    // min=1 max=12 step=1 default=4 label="Pixel size"
uniform vec3 u_color;     // color default=#f97316 label="Ink"
uniform vec3 u_color2;    // color default=#14141b label="Paper"
uniform float u_contrast; // min=0.5 max=2.5 step=0.05 default=1.3 label="Contrast"
uniform bool u_invert;    // default=false label="Invert"

// 8x8 ordered dither threshold built from the bits of the pixel coordinate.
float bayer8(vec2 p) {
  p = floor(mod(p, 8.0));
  float v = 0.0;
  for (int i = 0; i < 3; i++) {
    vec2 b = mod(floor(p / exp2(float(2 - i))), 2.0);
    v += (2.0 * b.x + 3.0 * b.y - 4.0 * b.x * b.y) * exp2(float(2 * i));
  }
  return v / 64.0;
}

void main() {
  vec2 cell = floor(vUv * u_resolution / u_pixel);
  vec2 uv = ((cell + 0.5) * u_pixel / u_resolution * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
  float t = u_travel;

  vec2 c1 = vec2(sin(t * 0.6), cos(t * 0.45)) * 0.55 + u_look * 0.6;
  vec2 c2 = vec2(cos(t * 0.35 + 2.0), sin(t * 0.55 + 1.0)) * 0.6;
  float v = 0.5 + 0.22 * sin(length(uv - c1) * 9.0 - t * 2.0) + 0.22 * sin(length(uv - c2) * 6.0 + t * 1.4);
  v += (fbm(uv * 1.8 + t * 0.1) - 0.5) * 0.5;
  v = (v - 0.5) * u_contrast + 0.5;
  if (u_invert) v = 1.0 - v;

  float lit = step(bayer8(cell), v);
  vec3 col = mix(u_color2, u_color, lit);
  gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
}
`,
})
