import { defineShader } from './common'

export default defineShader({
  id: 'holographic-foil',
  name: 'Holographic Foil',
  category: 'Glass/Refraction',
  description: 'Crinkled foil that shifts between two tints as it tilts. Hold and drag to tilt it.',
  bloom: { threshold: 0.75, intensity: 0.3 },
  body: /* glsl */ `
uniform float u_speed;   // min=0 max=2 step=0.05 default=0.35 label="Speed"
uniform vec3 u_color;    // color default=#ff6b9d label="Foil A"
uniform vec3 u_color2;   // color default=#06b6d4 label="Foil B"
uniform float u_scale;   // min=0.5 max=4 step=0.05 default=1.6 label="Crinkle"
uniform float u_sparkle; // min=0 max=2 step=0.05 default=1.0 label="Sparkle"

float hgt(vec2 p) {
  float t = u_travel * 0.2;
  vec2 q = p * u_scale;
  float h = fbm(q + t) + 0.5 * fbm(q * 2.3 - t * 1.3 + 4.0);
  float ridge = 1.0 - abs(fbm(q * 1.7 + 9.0 + t * 0.5) * 2.0 - 1.0);
  return h * 0.8 + ridge * 0.5;
}

void main() {
  vec2 p = screenUv();
  float e = 0.003;
  float h = hgt(p);
  float dx = hgt(p + vec2(e, 0.0)) - h;
  float dy = hgt(p + vec2(0.0, e)) - h;
  vec3 n = normalize(vec3(-dx / e * 0.09, -dy / e * 0.09, 1.0));

  vec2 tilt = u_look * 2.0 + 0.25 * vec2(sin(u_time * 0.2), cos(u_time * 0.27));
  vec3 V = normalize(vec3(tilt, 1.0));
  float ndv = dot(n, V);

  float film = ndv * 3.5 + h * 1.6 + tilt.x;
  vec3 foil = pal2(film * 0.5, u_color, u_color2);
  foil *= mix(0.6, 1.4, smoothstep(0.2, 0.9, ndv));

  float streak = pow(max(dot(n, normalize(vec3(-0.4 + tilt.x, 0.5 + tilt.y, 0.8))), 0.0), 18.0);
  foil += vec3(1.0, 0.95, 0.9) * streak * 0.8;

  float hs = hash21(floor((p + tilt * 0.2) * 70.0));
  float spark = step(0.93, hs) * pow(max(sin(ndv * 40.0 + hs * 60.0 + u_time * 1.5), 0.0), 10.0) * u_sparkle;
  foil += vec3(1.0, 0.9, 0.75) * spark * 1.6;

  gl_FragColor = vec4(finish(foil * 0.85, 1.0), 1.0);
}
`,
})
