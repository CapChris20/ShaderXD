import { defineShader } from './common'

export default defineShader({
  id: 'neon-grid-horizon',
  name: 'Neon Grid Horizon',
  category: 'Neon/Cyber',
  description: 'Retrowave floor and mountains under a sliced sun. Hold the mouse button and drag to look around.',
  bloom: { threshold: 0.7, intensity: 0.45, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;     // min=0 max=6 step=0.05 default=1.4 label="Speed"
uniform vec3 u_color;      // color default=#f0457f label="Grid color"
uniform vec3 u_sun_color;  // color default=#f97316 label="Sun color"
uniform float u_glow;      // min=0 max=3 step=0.05 default=1.2 label="Glow"
uniform float u_fog;       // min=0 max=1 step=0.01 default=0.55 label="Fog"
uniform bool u_sun_bands;  // default=true label="Sun stripes"

const vec3 SUN_DIR = normalize(vec3(0.0, 0.21, 0.98));

// Flat road down the middle, mountains rising on both sides.
float terrain(vec2 p) {
  float side = smoothstep(3.2, 12.0, abs(p.x));
  return side * (0.4 + 9.0 * pow(fbm(p * 0.085), 1.6));
}

float softShadow(vec3 p, vec3 l) {
  float res = 1.0;
  float t = 0.35;
  for (int i = 0; i < 14; i++) {
    vec3 q = p + l * t;
    float d = q.y - terrain(q.xz);
    res = min(res, 7.0 * d / t);
    t += clamp(d, 0.2, 2.5);
    if (res < 0.02 || t > 40.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

vec3 skyColor(vec3 rd) {
  float h = clamp(rd.y, 0.0, 1.0);
  // Warm cosine ramp: near-black maroon overhead, ember at the horizon.
  vec3 col = pal(sqrt(h), vec3(0.34, 0.07, 0.04), vec3(0.31, 0.06, 0.03), vec3(0.5, 0.52, 0.55), vec3(0.0, 0.0, 0.02));
  col *= smoothstep(1.0, 0.05, h) * 0.9 + 0.1;
  float toSun = max(dot(rd, SUN_DIR), 0.0);
  col += u_sun_color * (pow(toSun, 14.0) * 0.22 + pow(toSun, 120.0) * 0.12) * (0.6 + 0.4 * u_glow);
  return col;
}

// rgb = sun colour, a = coverage (stripes cut holes in it).
vec4 sun(vec3 rd) {
  if (rd.z < 0.05) return vec4(0.0);
  vec2 sp = rd.xy / rd.z - SUN_DIR.xy / SUN_DIR.z;
  float r = 0.24;
  float d = length(sp) / r;
  float disc = 1.0 - smoothstep(0.97, 1.0, d);
  float sy = sp.y / r;
  float gap = smoothstep(0.15, -0.95, sy) * 0.8;
  float stripes = smoothstep(gap - 0.02, gap + 0.02, fract(sy * 5.0 - u_travel * 0.05));
  float mask = u_sun_bands ? mix(1.0, stripes, step(sy, 0.2)) : 1.0;
  vec3 col = mix(u_color, u_sun_color, smoothstep(-0.7, 0.45, sy));
  return vec4(col * 1.0, disc * mask);
}

void main() {
  vec2 uv = screenUv();
  float t = u_time;

  vec3 ro = vec3(1.1 * sin(t * 0.11), 1.55 + 0.12 * sin(t * 0.19), u_travel);
  vec3 rd = normalize(vec3(uv, 1.45));
  float pitch = -0.015 + 0.014 * sin(t * 0.23) + u_look.y;
  float yaw = 0.09 * sin(t * 0.17) + u_look.x;
  rd.yz = rot(pitch) * rd.yz;
  rd.xz = rot(yaw) * rd.xz;

  // March the heightfield.
  float dist = 0.4;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    vec3 p = ro + rd * dist;
    if (p.y > 9.5 && rd.y > 0.0) break;
    float d = p.y - terrain(p.xz);
    if (d < 0.0006 * dist) { hit = true; break; }
    dist += max(0.02, d * 0.6);
    if (dist > 110.0) break;
  }
  if (hit) {
    // Settle onto the surface so the grid derivatives see a stable position.
    for (int i = 0; i < 3; i++) {
      vec3 p = ro + rd * dist;
      dist += (p.y - terrain(p.xz)) * 0.7;
    }
  }

  vec3 sky = skyColor(rd);
  vec3 col;
  if (hit) {
    vec3 p = ro + rd * dist;
    vec2 e = vec2(0.18, 0.0);
    vec3 n = normalize(vec3(terrain(p.xz - e.xy) - terrain(p.xz + e.xy), 2.0 * e.x, terrain(p.xz - e.yx) - terrain(p.xz + e.yx)));

    // Ambient occlusion: how much higher the surroundings are than this point.
    float around = 0.25 * (terrain(p.xz + vec2(1.4, 0.0)) + terrain(p.xz - vec2(1.4, 0.0)) + terrain(p.xz + vec2(0.0, 1.4)) + terrain(p.xz - vec2(0.0, 1.4)));
    float ao = clamp(1.0 - (around - p.y) * 0.5, 0.3, 1.0);

    vec3 l = normalize(SUN_DIR);
    float shadow = softShadow(p + n * 0.02, l);
    float diff = clamp(dot(n, l), 0.0, 1.0);

    // Glowing grid in world space, anti-aliased with screen-space derivatives.
    vec2 gp = p.xz * 0.5;
    vec2 w = fwidth(gp) * 1.4;
    vec2 a = abs(fract(gp - 0.5) - 0.5);
    vec2 core = 1.0 - smoothstep(vec2(0.0), w + 0.018, a);
    float line = max(core.x, core.y);
    float halo = exp(-a.x * 16.0) + exp(-a.y * 16.0);
    float far = exp(-dist * 0.012);
    float lineFade = clamp(1.0 - max(w.x, w.y) * 1.2, 0.0, 1.0);

    vec3 base = vec3(0.022, 0.006, 0.012) + u_sun_color * 0.045 * diff * shadow;
    vec3 gcol = mix(u_color, u_sun_color, smoothstep(6.0, 80.0, dist));
    vec3 grid = gcol * (line * 1.0 + halo * 0.2 * u_glow) * far * lineFade;
    col = base * ao + grid * mix(0.55, 1.0, shadow) * ao;
    col += u_sun_color * 0.12 * pow(diff, 2.0) * shadow * ao;
  } else {
    vec4 s = sun(rd);
    col = mix(sky, s.rgb, s.a);
  }

  // Sun-tinted fog, thicker toward the sun.
  float toSun = max(dot(rd, SUN_DIR), 0.0);
  float fogAmt = hit ? 1.0 - exp(-dist * (0.006 + 0.03 * u_fog)) : 0.0;
  vec3 fogCol = skyColor(normalize(vec3(rd.x, 0.02, rd.z))) * 0.9 + u_sun_color * pow(toSun, 6.0) * 0.5;
  col = mix(col, fogCol, fogAmt);

  // Horizon haze.
  col += mix(u_color, u_sun_color, 0.6) * exp(-abs(rd.y) * 22.0) * 0.28 * u_glow;

  gl_FragColor = vec4(finish(col, 1.0), 1.0);
}
`,
})
