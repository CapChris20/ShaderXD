// ASCII Liquid Chrome Morph — mirror-chrome blob that melts between shapes, redrawn as glyphs.
// Flow: raymarch chrome scene → sample luminance → pick a character cell → tint by hue.
// Used by: footer “Ship something that moves” background, sandbox, gallery.

import { defineShader } from './common'

export default defineShader({
  id: 'ascii-liquid-chrome',
  name: 'ASCII Liquid Chrome',
  category: 'Liquid',
  description:
    'The liquid chrome morph scene redrawn as text characters — a mirror blob melting between sphere, torus, cube and octahedron over a neon floor.',
  bloom: { threshold: 0.55, intensity: 0.4, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;   // min=0 max=2 step=0.05 default=0.7 label="Speed"
uniform float u_rows;    // min=32 max=96 step=1 default=64 label="Character rows"
uniform float u_glow;    // min=0 max=3 step=0.05 default=1.1 label="Glow"
uniform vec3 u_tint;     // color default=#ff2e88 label="Accent tint"

const float FLOOR_Y = -1.45;

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float sdBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdOcta(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.57735027;
}

// One shape that melts into the next: sphere → torus → cube → octahedron.
float morph(vec3 p, float t) {
  float ph = mod(t * 0.16, 4.0);
  float i = floor(ph);
  float f = smoothstep(0.0, 1.0, smoothstep(0.2, 0.8, fract(ph)));
  float d0 = length(p) - 1.0;
  float d1 = sdTorus(p, vec2(0.85, 0.38));
  float d2 = sdBox(p, vec3(0.78), 0.22);
  float d3 = sdOcta(p, 1.25) - 0.08;
  float a = d0;
  float b = d1;
  if (i > 0.5 && i < 1.5) { a = d1; b = d2; }
  else if (i > 1.5 && i < 2.5) { a = d2; b = d3; }
  else if (i > 2.5) { a = d3; b = d0; }
  return mix(a, b, f);
}

float mapScene(vec3 p, float t) {
  vec3 q = p;
  q.xz *= rot(t * 0.35);
  q.xy *= rot(t * 0.22);
  float d = morph(q, t);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec3 c = vec3(
      sin(t * 0.6 + fi * 1.9) * 1.7,
      sin(t * 0.8 + fi * 2.3) * 0.7,
      cos(t * 0.5 + fi * 1.3) * 1.7
    );
    d = smin(d, length(p - c) - (0.30 + 0.08 * sin(t * 1.3 + fi * 2.0)), 0.75);
  }
  d += 0.025 * sin(p.x * 6.0 + t * 1.4) * sin(p.y * 6.0 - t * 1.1) * sin(p.z * 6.0 + t * 0.9);
  return d;
}

vec3 getNormal(vec3 p, float t) {
  vec2 e = vec2(0.0015, -0.0015);
  return normalize(
    e.xyy * mapScene(p + e.xyy, t) +
    e.yyx * mapScene(p + e.yyx, t) +
    e.yxy * mapScene(p + e.yxy, t) +
    e.xxx * mapScene(p + e.xxx, t)
  );
}

float trace(vec3 ro, vec3 rd, float tmax, float t) {
  float travel = 0.02;
  for (int i = 0; i < 110; i++) {
    float d = mapScene(ro + rd * travel, t);
    if (d < 0.0008) return travel;
    travel += d * 0.9;
    if (travel > tmax) break;
  }
  return -1.0;
}

// The neon studio around everything.
vec3 env(vec3 rd, float lights, float t) {
  float el = rd.y;
  vec3 hor = mix(vec3(1.0, 0.22, 0.48), u_tint, 0.35);
  vec3 mid = vec3(0.34, 0.05, 0.62);
  vec3 top = vec3(0.01, 0.006, 0.09);
  vec3 c = mix(hor, mid, smoothstep(0.0, 0.32, el));
  c = mix(c, top, smoothstep(0.22, 0.85, el));
  c = mix(c, mix(hor * 0.45, vec3(0.015, 0.0, 0.05), smoothstep(0.0, -0.35, el)), smoothstep(0.0, -0.02, el));

  if (rd.z < -0.05) {
    vec2 u = rd.xy / -rd.z;
    vec2 sc = vec2(0.0, 0.07);
    float r = 0.14;
    float d = length(u - sc);
    float y = u.y - sc.y;
    float gap = y < 0.05 ? step(fract(y * 36.0), smoothstep(0.04, -r, y) * 0.85) : 0.0;
    float disc = smoothstep(r, r - 0.006, d) * (1.0 - gap);
    c += vec3(1.0, 0.3, 0.4) * exp(-d * 4.0) * 0.30 * u_glow;
    c = mix(c, mix(vec3(1.0, 0.1, 0.5), vec3(1.0, 0.8, 0.2), smoothstep(-r, r, y)) * 1.1, disc);
  }

  float az = atan(rd.x, rd.z) + t * 0.3;
  float strip = smoothstep(0.985, 0.998, cos(az * 3.0)) * smoothstep(-0.05, 0.05, el) * smoothstep(0.75, 0.55, el);
  vec3 sc2 = cos(az * 3.0 * 0.5) > 0.0 ? vec3(0.1, 0.9, 1.0) : vec3(1.0, 0.15, 0.8);
  c += sc2 * strip * 2.0 * lights * u_glow;
  float ring = exp(-pow((el - 0.34) / 0.012, 2.0)) * (0.5 + 0.5 * cos(az * 2.0));
  c += vec3(0.2, 0.8, 1.0) * ring * 1.8 * lights * u_glow;
  c += mix(vec3(1.0, 0.25, 0.85), vec3(0.2, 0.8, 1.0), 0.5 + 0.5 * sin(az)) * smoothstep(0.72, 0.9, el) * 1.5 * lights;
  return c;
}

vec3 chrome(vec3 p, vec3 rd, vec3 n, float t) {
  vec3 r = reflect(rd, n);
  float fr = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
  vec3 tint = 0.86 + 0.14 * cos(vec3(0.0, 2.0, 4.0) + dot(n, rd) * 5.0 + t * 0.3);
  vec3 refl;
  if (r.y < 0.0) {
    float tf = (FLOOR_Y - p.y) / r.y;
    vec3 fp = p + r * tf;
    vec2 g = abs(fract(fp.xz * 0.5) - 0.5);
    float line = smoothstep(0.04, 0.0, min(g.x, g.y));
    refl = vec3(0.02, 0.0, 0.07)
      + mix(vec3(1.0, 0.1, 0.7), vec3(0.1, 0.9, 1.0), 0.5 + 0.5 * sin(fp.x * 0.3)) * line * exp(-tf * 0.18) * 1.4;
    refl = mix(refl, env(vec3(r.x, 0.001, r.z), 1.0, t) * 0.35, 0.35);
  } else {
    refl = env(r, 1.0, t);
  }
  return refl * tint * (1.0 + 0.5 * fr);
}

vec3 renderScene(vec2 fragCoord, vec2 cs, float t) {
  vec2 uv = (fragCoord - 0.5 * u_resolution.xy) / u_resolution.y;
  uv -= u_look * 0.25;

  vec3 ro = vec3(0.0, 0.55, 8.6);
  ro.xz *= rot(0.35 * sin(t * 0.18));
  vec3 ta = vec3(0.0, -0.1, 0.0);
  vec3 fw = normalize(ta - ro);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.7 * fw);

  vec3 col;
  float tb = trace(ro, rd, 18.0, t);
  float tf = rd.y < 0.0 ? (FLOOR_Y - ro.y) / rd.y : -1.0;

  if (tb > 0.0 && (tf < 0.0 || tb < tf)) {
    vec3 p = ro + rd * tb;
    col = chrome(p, rd, getNormal(p, t), t);
  } else if (tf > 0.0) {
    vec3 p = ro + rd * tf;
    vec2 g = abs(fract(p.xz * 0.5) - 0.5);
    vec2 aa = vec2(tf * cs.y / (u_resolution.y * 1.7) * 0.5);
    float line = 1.0 - smoothstep(0.0, max(aa.x, aa.y) * 1.5 + 0.012, min(g.x, g.y));
    vec3 base = vec3(0.012, 0.0, 0.045);
    vec3 lc = mix(vec3(1.0, 0.1, 0.7), vec3(0.1, 0.9, 1.0), 0.5 + 0.5 * sin(p.x * 0.3));
    col = base + lc * line * exp(-tf * 0.10) * 1.3;

    vec3 rr = vec3(rd.x, -rd.y, rd.z);
    float tr = trace(p, rr, 12.0, t);
    vec3 refl;
    if (tr > 0.0) {
      vec3 hp = p + rr * tr;
      refl = chrome(hp, rr, getNormal(hp, t), t);
    } else {
      refl = env(rr, 0.0, t);
    }
    float fr = 0.25 + 0.5 * pow(1.0 - max(-rd.y, 0.0), 3.0);
    col += refl * fr * 0.55 * exp(-tf * 0.03);
    col += vec3(0.5, 0.15, 0.8) * exp(-dot(p.xz, p.xz) * 0.18) * 0.12;
    col = mix(col, vec3(0.55, 0.10, 0.40) * 0.7, 1.0 - exp(-tf * 0.022));
  } else {
    col = env(rd, 0.0, t);
  }

  col *= 1.0 - 0.30 * dot(uv, uv);
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(0.9));
  return col;
}

int glyphBits(int g) {
  if (g == 0) return 0;
  if (g == 1) return 128;
  if (g == 2) return 131200;
  if (g == 3) return 145536;
  if (g == 4) return 476718;
  if (g == 5) return 6593206;
  if (g == 6) return 15252014;
  if (g == 7) return 11512810;
  if (g == 8) return 15652654;
  if (g == 9) return 4329476;
  if (g == 10) return 15269425;
  if (g == 11) return 16301615;
  if (g == 12) return 31491134;
  if (g == 13) return 16303663;
  if (g == 14) return 32554047;
  if (g == 15) return 31520302;
  if (g == 16) return 32641183;
  if (g == 17) return 1082431;
  if (g == 18) return 18732593;
  if (g == 19) return 18470705;
  if (g == 20) return 15255086;
  if (g == 21) return 16301089;
  if (g == 22) return 16301361;
  if (g == 23) return 31504911;
  if (g == 24) return 18400580;
  return 0;
}

float glyph(int g, vec2 p) {
  p = (p - 0.5) * 1.2 + 0.5;
  vec2 q = floor(p * 5.0);
  if (q.x < 0.0 || q.x > 4.0 || q.y < 0.0 || q.y > 4.0) return 0.0;
  int bit = int(q.x) + 5 * int(q.y);
  return float((glyphBits(g) >> bit) & 1);
}

void main() {
  // 1. Animation time from integrated speed (and footer scroll travel).
  float t = u_travel;

  // 2. Character cell size from the Rows control.
  float rows = max(u_rows, 24.0);
  vec2 fragCoord = vUv * u_resolution;
  vec2 cs = vec2(0.56, 1.0) * u_resolution.y / rows;
  vec2 cid = floor(fragCoord / cs);
  vec2 cp = fract(fragCoord / cs);
  vec2 cc = (cid + 0.5) * cs;

  // 3. Render the chrome morph at the cell center, then pick a glyph by luminance.
  vec3 col = renderScene(cc, cs, t);
  float lum = dot(col, vec3(0.30, 0.55, 0.15));
  int g = int(clamp(floor(pow(lum, 1.05) * 9.8), 0.0, 8.0));
  float mx = max(max(col.r, col.g), max(col.b, 0.001));
  vec3 hue = col / mx;
  float on = glyph(g, cp);
  vec3 outc = hue * (0.30 + 0.95 * clamp(lum, 0.0, 1.0)) * on;
  outc += col * 0.10 * (g > 0 ? 1.0 : 0.0);

  // 4. Skip the shared finish curve — renderScene already tonemapped; keep ASCII crisp.
  gl_FragColor = vec4(pow(clamp(outc, 0.0, 1.0), vec3(2.2)), 1.0);
}
`,
})
