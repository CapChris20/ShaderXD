# ShaderXD progress log

## Step 1: Environment
- Node v22.22.0, npm 10.9.4, git 2.43.0 (all meet requirements).
- /home/user/shaderxd did not exist; created app/, references/, notes/.

## Step 2: Skills and plugins
- (5) threejs-skills: repo exists. https://github.com/cloudai-x/threejs-skills commit 0e181866f095b5f06d005133876e926515390d95 (2026-10-19). threejs-shaders present. 13 skills copied to .claude/skills/. Grepped for suspicious patterns: none. MIT.
- (7) motion: LLMTooling/agent-skills commit f096e2bcc375e76b57ca27247040849fa01eaf56, skills/animation-graphics/motion.skill (zip, 215KB). Extracted only motion to .claude/skills/motion/. Other 7 .skill files in that repo NOT installed.
- (3) SearchPlugins found "Skills For Real React/React Native Engineers" (Anthropic Directory, community, author Jan Blazej, v1.7.1, id plugin_019jXWbBzAXjfXuULAmrg5x9). Bundle: ~38 skills, 8 commands, 8 agents. Install card shown to user.
- (4) gsap-skills and (6) shader-skills: marketplace adds require your approval per rules; pending.
- (1) frontend-design / (2) design plugin: see report.
- (4),(6): user chose Skip for now. Not installed.

## Step 3: Libraries
- create-vite 9.3.1 react-ts into app/. Installed three 0.186.1, @react-three/fiber 9.8.2, drei 10.7.9, postprocessing 3.2.2, lamina 1.2.2, motion 14.6.0, gsap 3.15.0 (all exact). react/react-dom pinned 19.3.1.
- npm reported no peer errors, 0 vulnerabilities. NOTE: lamina is old (R3F 8 era); installed but not yet used.
- Dev server: vite 8.3.5 starts in ~350ms, HTTP 200.

## Step 4: References
- Cloned webgl-shader-lab@12126e2, awesome-web-shaders@74c13b8, r3f-webgl-shader@5854eca into references/. Notes in notes/references.md. (awesome list file is readme.md, lowercase.)

## Step 5: Build (started)
- Added vitest as exact dev dep for parser tests.
- a) Shader format: src/shaders/{types,common,neonGridHorizon,index}.ts. Each shader = GLSL with annotated `uniform` lines; `defineShader()` prepends a shared header (u_time, u_resolution, u_look, u_travel + cosine palette/noise/vignette helpers) and sets `uniforms = parseUniforms(fragment)`, so controls can't drift from the GLSL.
- b) Parser: src/lib/parseUniforms.ts, 9 vitest tests. float->slider, vec3 named *color*/flagged `color`->picker, bool->toggle; built-ins/other types skipped.
- c/d) Canvas + panel: src/export/ShaderXD.template.tsx is the single runtime (ShaderView). The app renders it directly AND the export modal ships its text, so preview == export. Own ShaderMaterial in useMemo, shared uniforms object, dispose on unmount (pattern from webgl-shader-lab).
- e) Export modal (motion/react for enter/exit): Usage tab + full ShaderXD.tsx tab, Copy button.
- f) neon-grid-horizon: raymarched heightfield, cosine-palette sky, sliced sun, soft shadow + AO + sun-tinted fog, bloom (postprocessing) + vignette/filmic curve, slow camera sway, mouse-look while held.
- FAILED/decided: (1) first render had empty vertex shader because template placeholder was imported directly -> moved the real vertex shader into the template. (2) sun was blown out white / sky greenish / jagged grid lines -> retuned palette constants, tightened march threshold + 3 refinement steps. (3) Playwright fake clock hangs screenshots -> abandoned; used mean-colour comparison. (4) Could not confirm u_speed visually in headless software GL (~1 fps + dt clamp 0.1 => tiny travel); logged as unverified.
- Verified in headless Chromium (swiftshader): no console errors (only R3F-internal THREE.Clock deprecation warning); glow/fog sliders, both colour pickers and the toggle change the canvas; Export opens, snippet shows live values, Copy puts exact text on clipboard; Esc/backdrop/Close all close; drag-to-look works.
- Edited-not-replaced: scaffold App.tsx/App.css/index.css left untouched; main.tsx now imports ShaderXDApp.tsx + styles.css.

## Step 5 (cont.): Gallery
- Added 3 original shaders in the same format: ember-smoke (Fire/Smoke), liquid-chrome (Liquid), optic-tunnel (Geometric). 4 total.
- Iterations: ember was muddy -> added contrast (heat remap). Optic tunnel v1 was a fat ring + spokes with a rainbow fringe (violates "no rainbow") -> v2 screen-space line widths; v3 two-tone (mint/orange) fringe, denser rings. Tunnel is still the weakest: paler than the others.

## Step 6: Verify
- Dev server: starts, HTTP 200, no console errors across all 4 shaders (only warning: THREE.Clock deprecated, from inside R3F 9.8.2).
- Controls (headless Chromium, software GL, speed frozen to quiet the baseline): every slider/colour/toggle on all 4 shaders changed the canvas EXCEPT u_speed, which I could not confirm (software GL ~1fps + dt clamp 0.1 => tiny travel). Unverified on real hardware.
- Export modal: values appear in snippet, Copy writes the exact text to the clipboard, Esc/backdrop/Close all close it. Exported ShaderXD.tsx passes strict tsc.
- npm test: 22 pass. npm run lint: clean. npm run build: OK (1.38MB JS chunk, 388KB gzip; chunk-size warning from three.js).
- Screenshots in notes/screenshots/.
- Step 2: frontend-design = "Unknown skill" in this session. Project-local skills in .claude/skills are NOT loaded in this session (discovered at session start; session root was /home/user). gsap-skills and shader-skills skipped at user's request. React skills plugin: install card shown, not yet enabled by user.
- Unused installed deps (per brief): drei, lamina, gsap. lamina is old (R3F 8 era) and untested with R3F 9.
- Rules kept: no commits/pushes, no deletions, only npm registry + GitHub requests. Scaffold App.tsx/App.css/index.css untouched but unused. Dev server stopped.

## Redesign pass (after user feedback: "you only made one page")
- Studied 3 reference videos (frame contact sheets via ffmpeg). Findings in notes/WEB_APP_STYLE_GUIDE.md.
- Rebuilt as a cinematic multi-section scroll site (src/site/): Hero (live neon shader driven by scroll) -> pinned scroll-scrubbed Reel (6 shaders) -> Gallery (paper cutout + risograph cards, 13 thumbnails in public/thumbs) -> Sandbox (old tool, glass panel, clay chips) -> How it works (Bauhaus, motion useScroll parallax) -> Why (flow field) -> Footer (ASCII). Old ShaderXDApp.tsx kept, unused.
- 20 effects split: SHADERS (10): liquid morph, holographic foil, dithering, halftone, particle swarm, glitch, topographic lines, vaporwave grid (= existing neon-grid-horizon), metaballs, ray-marched fractal. SITE (10): ASCII, Bauhaus, neon glow, clay, kinetic type, pixel art, risograph, glassmorphism, paper cutout, flow fields.
- Runtime template extended: travelOffset (scroll), interactive flag, dpr, paused. Bare route ?bare&shader=id (also thumbnails/embeds).
- Verified (headless Chromium): no console errors across full scroll; gallery card -> sandbox; colour+density control change canvas; export snippet reflects values; mobile 390px no overflow. 49 tests, lint clean, build ok. Published artifact v2 (same URL).
- NOT verified: real-GPU frame rate (3 canvases max live; heavy shaders: fractal, neon); u_speed on real hardware; AI-video frame-sequence scrubbing (no video source available here, used live shaders instead).
- Deps added: @fontsource/bricolage-grotesque, instrument-serif, jetbrains-mono (5.3.0, exact).
- Stopped nothing; dev server still running on :5173 in this container.

## Multi-page pass (user pointed at a reference artifact with six pages)
- Added hash-routed pages: #home, #discover, #sandbox, #creators, #pricing, #signup (src/site/pages/*, useRoute.ts, PageBand.tsx, catalog.ts). Sandbox moved off Home onto its own page. Each page opens on its own live shader band.
- Discover: search, category pills, free-only, count, empty state, card -> sandbox. Creators: validated upload form (prototype only), 70% earnings calc, example-data dashboard. Pricing: 3 tiers, compare table, FAQ. Signup: validated form (prototype only).
- Verified in headless Chromium: all page interactions pass (search/filters/click-through/forms/FAQ/route fallback), no console errors, no horizontal overflow at 390px on any page. One apparent failure (nav current text) was a test artifact (CSS uppercases the label).
- Bug fixed: old .panel rule from the first sandbox stylesheet leaked into Creators (320px wide).
- Published artifact v5 (same URL). Devora prompt updated: notes/DEVORA_PROMPT_v3.md (v1, v2 kept).
- Unverified: real-GPU performance; mock prices/plans are prototype data only, nothing is charged or stored.
