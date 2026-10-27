# Reference repos (read-only, in `references/`)

None of this code is imported or copied verbatim into `app/`. Patterns only.

## PSCactux/webgl-shader-lab (MIT) @ 12126e2
14 R3F effects, each with a lil-gui control panel. Vite + React + TS, same stack as ours.

What I learned
- `src/lib/material.ts` documents a real R3F gotcha: `<shaderMaterial uniforms={...} />` copies each `{ value }`
  wrapper, so later writes to `uniforms.uTime.value` never reach the GPU. The fix is to build the `THREE.ShaderMaterial`
  yourself once (`useMemo`), keep one shared uniforms object, and `dispose()` in an effect cleanup.
- `src/components/ScreenQuad.tsx`: a 2x2 plane, `frustumCulled={false}`, `depthTest/depthWrite: false`, with a vertex
  shader that ignores the camera. This is the right shape for fragment-only effects.
- `src/lib/gui.ts`: params live in a stable mutable object; the GUI writes into it and `useFrame` reads from it. No React
  re-render per slider tick.
- `Vhs.tsx` evaluates the scene as a function so each colour channel can be sampled at a shifted coordinate rather than
  using a render target. Useful idea for cheap chromatic dispersion.

Borrowed and adapted
- Own-the-material pattern -> `ShaderCanvas.tsx` builds the material in `useMemo`, shares one uniforms object, disposes on
  unmount. Adaptation: values come from our parsed controls via a ref, not lil-gui.
- Screen-quad pattern -> same plane/depth settings. Adaptation: our vertex shader is a one-liner shared by every shader.
- "Mutable params read in useFrame" -> `valuesRef` in `ShaderCanvas.tsx`, so sliders update the canvas without
  rebuilding the material.
- Per-channel sampling idea -> used in the optic-tunnel gallery shader for dispersion.

Not borrowed: its VHS retrowave scene. The user wants an original neon grid horizon; I wrote my own (raymarched
heightfield terrain, own camera, own palette).

## OwnKng/r3f-webgl-shader (2021, no license file found in the file list)
One plane with a hand-written vertex/fragment pair, `uTime` written each frame from `clock.elapsedTime`, and the mouse
mapped into a uniform. Older style (JS, `<shaderMaterial uniforms>` in JSX, which hits the gotcha above because the
values are mutated through `material.current.uniforms`; that works only because it goes via the ref).

Borrowed and adapted
- Time + pointer into uniforms each frame in `useFrame` -> our `u_time` and `u_look`. Adaptation: `u_look` only moves
  while the pointer button is held, is smoothed, and eases back to zero on release.
- Nothing else; its GLSL (hsl2rgb colouring) is not our style (we use cosine palettes).

## owenob1/awesome-web-shaders (CC0) @ 74c13b8
A curated list, not code. File is `readme.md` (lowercase). Sections on libraries, galleries, utilities, tools, and
agent skills.

Useful later
- Lygia (cross-language GLSL function library) for reusable noise/lighting functions. Check its licence before
  using it in an exportable product; I did not pull it in.
- glsl-noise, GL Transitions (a portable GLSL spec) for more shaders to study.
- Shadertoy is listed as inspiration only; no API use, per the project rules.

Borrowed and adapted: nothing directly; used to confirm `drei`'s `shaderMaterial` exists as an alternative. I chose a
plain `THREE.ShaderMaterial` so the exported component has one fewer dependency.
