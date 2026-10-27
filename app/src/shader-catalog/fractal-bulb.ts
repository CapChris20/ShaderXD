import { defineShader } from './common'

export default defineShader({
  id: 'fractal-bulb',
  name: 'Fractal Bulb',
  category: 'Space/Fractals',
  description: 'A ray-marched Mandelbulb orbiting slowly, lit with orbit-trap colour. Drag to orbit.',
  bloom: { threshold: 0.55, intensity: 0.5, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;   // min=0 max=3 step=0.05 default=0.5 label="Orbit speed"
uniform float u_power;   // min=3 max=10 step=0.1 default=8 label="Power"
uniform vec3 u_color;    // color default=#f97316 label="Color A"
uniform vec3 u_color2;   // color default=#ff6b9d label="Color B"
uniform float u_glow;    // min=0 max=3 step=0.05 default=1.2 label="Glow"
uniform bool u_morph;    // default=true label="Auto-morph"

float gPower;
float gTrap;

float map(vec3 pos) {
  vec3 z = pos;
  float dr = 1.0;
  float r = 0.0;
  gTrap = 1e3;
  for (int i = 0; i < 6; i++) {
    r = length(z);
    if (r > 2.0) break;
    float theta = acos(clamp(z.z / r, -1.0, 1.0));
    float phi = atan(z.y, z.x);
    dr = pow(r, gPower - 1.0) * gPower * dr + 1.0;
    float zr = pow(r, gPower);
    theta *= gPower;
    phi *= gPower;
    z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta)) + pos;
    gTrap = min(gTrap, r);
  }
  return 0.5 * log(r) * r / dr;
}

vec3 calcNormal(vec3 p, float t) {
  vec2 e = vec2(0.5, -0.5) * 0.0012 * t;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

void main() {
  vec2 uv = screenUv();
  gPower = u_power + (u_morph ? 1.4 * sin(u_travel * 0.4) : 0.0);

  float a = u_travel * 0.25 + u_look.x * 2.0;
  float b = 0.35 + u_look.y * 1.5;
  vec3 ro = 2.5 * vec3(cos(a) * cos(b), sin(b), sin(a) * cos(b));
  vec3 f = normalize(-ro);
  vec3 rt = normalize(cross(f, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, f);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.7 * f);

  float t = 0.8;
  float minD = 1e3;
  float steps = 0.0;
  bool hit = false;
  for (int i = 0; i < 90; i++) {
    float d = map(ro + rd * t);
    minD = min(minD, d);
    if (d < 0.0008 * t) { hit = true; steps = float(i); break; }
    t += d;
    if (t > 6.0) break;
  }

  vec3 bg = vec3(0.016, 0.007, 0.01) + u_color * 0.06 * smoothstep(1.4, -0.4, uv.y);
  vec3 col = bg;
  if (hit) {
    vec3 p = ro + rd * t;
    map(p);
    float trap = gTrap;
    vec3 n = calcNormal(p, t);
    vec3 L = normalize(vec3(0.6, 0.8, 0.4));
    float diff = clamp(dot(n, L), 0.0, 1.0);
    float ao = clamp(1.0 - steps / 90.0 * 1.6, 0.15, 1.0);
    vec3 base = pal2(clamp(trap * 0.6, 0.0, 0.5), u_color2, u_color);
    col = base * (0.12 + 0.95 * diff) * ao;
    col += u_color2 * pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0) * 0.35;
    col = mix(col, bg, smoothstep(3.0, 5.5, t));
  }
  col += mix(u_color, u_color2, 0.3) * exp(-minD * 14.0) * 0.28 * u_glow;
  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
