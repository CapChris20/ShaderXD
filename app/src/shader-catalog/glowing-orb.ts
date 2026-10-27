// Glowing orb and orbital light raymarcher (adapted from Shadertoy-style mainImage).
// Same look and colors as the original. Clarity: finer ray marching, finer normals,
// anti-aliasing (set AA to 1 if it runs slowly) and a slight midtone lift.
// Used by: home hero background, sandbox, gallery.

import { defineShader } from './common'

export default defineShader({
  id: 'glowing-orb',
  name: 'Glowing Orb',
  category: 'Neon/Cyber',
  description:
    'A bouncing sphere on a dark plane lit by an orbiting light, with a soft volumetric glow along the ray.',
  bloom: { threshold: 0.35, intensity: 0.75, glowUniform: 'u_glow' },
  body: /* glsl */ `
uniform float u_speed;        // min=0 max=4 step=0.05 default=1.0 label="Speed"
uniform vec3 u_glow_color;    // color default=#19ffd1 label="Glow color"
uniform float u_glow;         // min=0 max=3 step=0.05 default=1.2 label="Glow"
uniform float u_orbit;        // min=1 max=10 step=0.1 default=5.0 label="Orbit size"
uniform float u_bounce;       // min=0 max=2 step=0.05 default=1.0 label="Bounce"

const int AA = 2;             // 1 = off, 2 = smooth edges (4 samples per pixel)
const int MAX_STEPS = 200;
const float MIN_DIST = 0.001;
const float MAX_DIST = 100.0;

// Scene distance: bouncing sphere + ground plane.
// vocab: u_travel is speed integrated over time, so the Speed slider changes rate not jump.
float GetDist(vec3 p, float t) {
  float bounce = pow(sin(t), 2.0) * u_bounce;
  vec4 sphere = vec4(0.0, bounce + 1.0, 6.0 + bounce * 0.5, 1.0);
  float d_sphere = length(p - sphere.xyz) - sphere.w;
  float d_plane = p.y;
  return min(d_plane, d_sphere);
}

// March until we hit something or run out of distance.
// Returns (distance along ray, closest approach to any surface).
vec2 RayMarch(vec3 r_origin, vec3 r_direction, float t) {
  float d_origin = 0.0;
  float min_dist = 1000000.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = r_origin + d_origin * r_direction;
    float d_surf = GetDist(p, t);
    min_dist = min(d_surf, min_dist);
    d_origin += d_surf;
    if (d_surf < MIN_DIST || d_origin > MAX_DIST) break;
  }

  return vec2(d_origin, min_dist);
}

vec3 GetNormal(vec3 p, float t) {
  float d = GetDist(p, t);
  vec2 e = vec2(0.001, 0.0);
  vec3 n = d - vec3(
    GetDist(p - e.xyy, t),
    GetDist(p - e.yxy, t),
    GetDist(p - e.yyx, t)
  );
  return normalize(n);
}

// Diffuse lighting plus a soft glow when the light ray misses the scene.
vec3 GetLight(vec3 p, float t) {
  vec3 lightPos = vec3(0.0, 3.0, 6.0);
  lightPos.xz += vec2(u_orbit * sin(t), u_orbit * cos(t));

  vec3 l = normalize(lightPos - p);
  vec3 n = GetNormal(p, t);
  float dif = clamp(dot(n, l), 0.0, 1.0);

  vec2 rm = RayMarch(p + n * MIN_DIST * 1.1, l, t);
  float mindist = rm.y;
  float d = rm.x;

  if (d < length(lightPos - p)) dif *= 0.1;

  vec3 lightCol = vec3(0.0);
  if (d >= MAX_DIST) {
    // Manipulate here: volumetric glow falloff along a missed light ray.
    float glowStrength = 0.05 * u_glow;
    lightCol = glowStrength * (u_glow_color * vec3(
      10.0 / (mindist + 0.09),
      1.0 / (mindist + 0.5),
      1.0 / (mindist + 0.09)
    ));
  }

  return dif + lightCol;
}

// One camera ray through a screen-space uv (already look-nudged).
vec3 render(vec2 uv, float t) {
  vec3 r_origin = vec3(0.0, 1.0, 0.0);
  vec3 r_direction = normalize(vec3(uv.x, uv.y, 1.0));

  vec2 rm = RayMarch(r_origin, r_direction, t);
  float mindist = rm.y;
  float dist = max(rm.x, 0.001);
  vec3 p = r_origin + r_direction * dist;
  vec3 diffuse = GetLight(p, t);

  // Original compositing: soft glow edge + distance haze.
  return diffuse * mindist * 2.0
    + vec3(
      1.5 * diffuse.y / dist,
      0.3 * diffuse.z / dist,
      0.3 * diffuse.x / dist
    );
}

void main() {
  // 1. Pick animation time from travel so Speed (and hero scroll) drive the motion.
  float t = u_travel;
  vec2 baseUv = screenUv() - u_look * 0.35;

  // 2. Anti-alias: average a small grid of sub-pixel rays (AA=1 skips the extra cost).
  vec3 sum = vec3(0.0);
  for (int j = 0; j < AA; j++)
  for (int i = 0; i < AA; i++) {
    vec2 o = (vec2(float(i), float(j)) + 0.5) / float(AA) - 0.5;
    vec2 uv = baseUv + o * (2.0 / u_resolution.y);
    sum += clamp(render(uv, t), 0.0, 1.0);
  }
  vec3 col = sum / float(AA * AA);

  // 3. Slight midtone lift so dark parts read clearer; colors unchanged.
  col = pow(col, vec3(0.85));

  gl_FragColor = vec4(finish(col, 0.85), 1.0);
}
`,
})
