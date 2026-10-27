# How I want web apps built

Written from three reference videos (cinematic scroll sites, a "motion designer" reel, a Marvel-style hero page)
and from the mistakes in the first ShaderXD pass. Read this before starting any web app or prototype.

## 0. The one rule

**Build an experience, not a tool UI.** The first ShaderXD pass was one sandbox page: a canvas and some sliders.
That is a component demo. What I want is a *site*: a hero, scroll-driven scenes, a gallery, the working tool as one
section, and a footer. People should want to scroll it and screen-record it.

If I say "prototype", it still means a multi-section page with a real hero and motion. The working feature is
one section of it, not the whole thing.

## 1. What the reference videos have in common

| Video | What it shows | Take |
|---|---|---|
| "Make this scroll effect in minutes" | A hero object (Iron Man disintegrating, an exploded watch, a camera, AirPods) plays **frame by frame as you scroll**. Made by generating a short video, splitting it into JPG frames, and prompting an AI builder: *"a scroll-scrubbed image sequence on a canvas, the animation plays frame by frame as I scroll"*. | Scroll is the timeline. One strong hero object per section. |
| "5.5 is ridiculous at motion" | A motion-designer reel as a website: full-screen scenes, orange poster type ("CLAUDE. *motion designer*"), a 3D block-wave terrain with an orb, kinetic serif text ("*on purpose.*"), an animated bar chart, a glass login card on a blue field, black blobs on orange. Tiny mono HUD labels in the corners. | Each scene has a different effect but one shared system: bold type, one hot accent, mono HUD. |
| "Websites in 2026" | Dark pages, giant editorial headlines mixing a heavy grotesk with an italic serif ("CRAFTING *EXCELLENCE*"), hero characters with smoke/debris, scroll transitions between sections, corner-bracket frames, thin UI chrome. | Cinematic and editorial, not "SaaS landing page". |

Common DNA: dark or hot-saturated backgrounds, huge type, mixed grotesk + italic serif + mono, one accent colour,
**motion tied to scroll**, a visible frame/HUD, and a real object or shader in the middle of every scene.

## 2. How these get made

### A. Scroll-scrubbed frame sequence (what video 1 teaches)
1. Make a 5-10 s hero clip of the object (AI video tool, or render it).
2. Split to frames: `ffmpeg -i hero.mp4 -vf "fps=30,scale=1280:-2" frames/%04d.jpg`.
3. Preload the frames, draw frame `i` to a `<canvas>` where `i = round(scrollProgress * (n-1))`.
4. Pin the stage with `position: sticky` inside a tall section (e.g. `height: 500vh`).
5. Overlay type that reveals at scroll thresholds.

If I give a reference image or clip, **use that actual asset** as the texture/frames. Never redraw it from scratch.

### B. Live scroll-scrubbed shaders (what I built for ShaderXD)
Same pinned stage, but the "frames" are a live WebGL shader. Scroll position drives the shader's time (`u_travel`)
and picks which shader is active. No assets, infinite resolution, and it stays interactive.
Use B when there is no source video. Use A when I supply footage or want photoreal objects.

### C. Prompting pattern for an AI builder
> Build a cinematic, scroll-driven site for **[product]**. Dark, [accent colour], giant editorial type
> (heavy grotesk + italic serif + mono HUD labels). Sections: hero with a live [shader/3D/image-sequence] background,
> a pinned scroll-scrubbed reel of [N] scenes, a gallery, the working tool, how-it-works, footer CTA.
> Use [list of effects]. Every section needs its own visual idea. Mobile must work. No generic cards.

## 3. Visual direction (my taste)

- Prefer **3D, neon, retrowave, glass, glowing light, optical-illusion** looks.
- Avoid flat, muddy or dim results. Contrast and glow matter.
- **Cosine palettes** for colour (`a + b*cos(2π(c*t+d))`). A two-colour swing is `pal2(t, c1, c2)`.
- **No rainbow palettes. No default blue/purple.** Hot accents: ember orange `#ff4d12`, hot pink `#ff2e88`,
  amber `#ffb02e`, mint `#19ffd1` (sparingly), bone `#f3ece4`, near-black warm `#0a0706`.
- Lighting vocabulary: soft shadows, ambient occlusion, sun-tinted fog, bloom, **vignette with a tone curve**
  (filmic/ACES), slow camera motion, mouse-look while the button is held.
- Type: display grotesk (Bricolage Grotesque 800) + italic serif accent (Instrument Serif) + mono for HUD labels
  (JetBrains Mono). Bundle fonts with npm (`@fontsource/*`); do not depend on a CDN.
- Chrome: corner-bracket frames, numbered kickers (`// 03 · THE SANDBOX`), mono uniform read-outs, progress ticks.

## 4. The effects menu (and how each is done)

| Effect | Implementation | Used for |
|---|---|---|
| Kinetic typography | Per-letter spring reveal, hover wobble (`motion/react`), mixed display/serif segments | Every headline |
| Neon glow | Layered `text-shadow` / `box-shadow` in pink + ember, slow flicker | CTAs, accent words |
| Glassmorphism | Translucent gradient + `backdrop-filter: blur(18px) saturate(1.5)` + inner highlight. **Tint it dark on light sections** or it vanishes | Nav, panels, cards |
| Claymorphism | Soft gradient + inset light/dark shadows + hard under-lip; pressed state drops 3px | Buttons, chips |
| Pixel art | Character-map sprites drawn 1px/cell on a canvas, `image-rendering: pixelated` | Logo, bullets, icons |
| Risograph | Greyscale `multiply` over a spot colour, offset second plate, dot screen, true colour on hover | Gallery cards |
| Paper cutout | Stacked sheets with seeded jagged `clip-path` edges + hard offset `drop-shadow` | Section transitions |
| Bauhaus shapes | Circle / half-circle / triangle / bar / ring, parallax + rotate on scroll (`useScroll`) | "How it works" |
| Flow fields | Canvas 2D particles on a noise angle field, fading trails, pointer repels | "Why" band |
| ASCII art | Canvas text grid, brightness mapped to a character ramp, animated scene | Footer CTA |
| Liquid morph, holographic foil, dithering, halftone, particle swarm, glitch, topographic lines, vaporwave grid, metaballs, ray-marched fractal | Fragment shaders (see `app/src/shaders/`) | Reel and gallery |

## 5. Page anatomy

1. **Hero:** full-bleed live shader, giant kinetic headline, one-line pitch, two CTAs (neon + clay), scroll cue.
2. **Reel:** pinned, scroll-scrubbed scenes with a HUD, big caption, progress ticks. Chunky wipe between scenes.
3. **Gallery:** the library as tactile cards. Each card is a real preview.
4. **Tool section:** the actual working feature (sandbox, controls, export).
5. **How it works:** three steps with strong geometry.
6. **Why:** the problem, with an ambient canvas behind glass cards.
7. **Footer:** one huge CTA over an ambient canvas.

Alternate dark and light sections so the page has rhythm. Every section gets a different visual idea.

## 6. Engineering rules

- Stack: Vite + React + TypeScript, React Three Fiber, `motion` (import from `motion/react`), GSAP when a timeline needs it.
- **Pin exact versions** in `package.json`.
- Shaders are GLSL strings with annotated uniforms; controls are *parsed* from the GLSL so they cannot drift.
  `float` -> slider, `vec3 *color*` -> picker, `bool` -> toggle, `sampler2D` -> upload (not built yet).
- Build your own `THREE.ShaderMaterial` once and mutate one shared `uniforms` object. A JSX `uniforms` prop is
  copied by R3F, and later writes never reach the GPU. Dispose on unmount.
- Drive travel from `u_travel = ∫ u_speed dt` so moving a speed slider changes velocity, not position.
- **Never run more than ~3 WebGL contexts at once.** Wrap every canvas in a `LazyMount` (IntersectionObserver).
- Decorative backgrounds: `interactive={false}` so touch scrolling passes through; lower `dpr`.
- Respect `prefers-reduced-motion`.
- The preview and the export must be the *same code path*, so they cannot drift.
- Do not delete files; add new ones. Do not commit or push unless asked.

## 7. What "done" means (verification checklist)

- [ ] Opened in a real browser (or headless Chromium) with **no console errors**.
- [ ] A screenshot of **every section** was looked at, not just the top of the page.
- [ ] Every control changes the output (test with a no-change baseline; freeze animation so the baseline is quiet).
- [ ] Mobile viewport (390 px): no horizontal overflow, text readable.
- [ ] `npm test`, lint, and `npm run build` pass.
- [ ] Published as an **artifact** (multi-file via `files`) so I can open it, not just "run `npm run dev`".
- [ ] The report says what is *unverified* (for example: real-GPU performance), not only what worked.

## 8. Mistakes to not repeat

1. Delivering one sandbox page and calling it a prototype.
2. Not asking for, or not studying, the visual references first.
3. Sending a "run it yourself" instruction instead of publishing an artifact.
4. Shaders that come out pale, muddy or washed by tone mapping. Check the screenshot; retune.
5. Rainbow fringes from per-channel dispersion. Use a two-colour fringe.
6. White-on-white chrome: a glass nav that disappears over a light section.
7. Reporting "works" for a check that was actually inconclusive.
