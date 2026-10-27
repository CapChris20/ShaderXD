# Prompt: build a cinematic scroll site for Devora

Paste everything below the line into a new Claude Code session.

---

Attach the GitHub repo `CapChris20/devora` (use add_repo, then clone it) and read it **before building anything**:
README, package.json, the folder structure, main source files, docs, screenshots, and any DESIGN.md or style notes.
Write a short `notes/devora-brief.md` first with: what Devora is, who it is for, the 3-5 things it does best,
the real feature names and any real numbers, and what is still unfinished. Use only facts from the repo. If something
is unclear, say so in the brief instead of inventing it, and ask me.

Then build a **cinematic, multi-section, scroll-driven marketing site** for Devora, in the same spirit as the ShaderXD
site we just made. Not a single page, not a dashboard, not a component demo.

## Read these first (in the ShaderXD project, if you can reach them; otherwise follow the summary below)
- `shaderxd/notes/WEB_APP_STYLE_GUIDE.md` (how I want web apps built)
- `shaderxd/app/src/site/` (hero, pinned reel, gallery, sandbox, how-it-works, footer, and the effect components)

## Structure (adapt the content to Devora)
1. **Hero:** full-bleed live background (a shader or canvas that reacts to scroll), giant kinetic headline mixing a heavy
   grotesk with an italic serif accent word, one-line pitch, one primary button and one ghost button, scroll cue.
2. **Pinned scroll reel:** `position: sticky` inside a tall section. Scroll position picks the scene and drives its
   motion. One scene per real Devora feature, each with its own visual idea, a HUD label, a big caption, progress ticks.
3. **Showcase section** for the thing Devora is actually about (real screenshots, real UI, or a live demo from the repo).
   If I supply images or footage, use those real assets, never recreations.
4. **How it works:** three steps with bold geometry and scroll parallax.
5. **Why / problem section** with an ambient canvas behind translucent cards.
6. **Footer:** one huge call to action over an ambient canvas.

## Look and feel
- Take the palette, gradients, surfaces and shadows from Devora's own DESIGN.md if it has one. If it does not, use
  this one: background `#0a0a0f`, surface `#141419`, accents `#ff6b9d` (pink), `#f97316` (orange), `#06b6d4` (cyan),
  text `#f5f2fa`, primary button gradient `#be185d -> #c2410c`.
- Text gradients: headlines use a vertical top-lit gradient (white to `#e6e2ee`); accent words use light pink -> pink ->
  orange; numerals and titles can use a 120deg pink -> orange gradient. A short pink -> orange -> cyan rule sits under
  each section title.
- **No gray-pink washed look. No neon glow on text or buttons. No rainbow palettes. No default blue/purple.**
  Depth comes from dark layered shadows and a 1px top highlight.
- Fonts: bundle them with npm (`@fontsource/*`), no CDN. Heavy grotesk + italic serif + mono for HUD labels.
- Chrome: corner-bracket frames, numbered kickers like `// 03 · THE SHOWCASE`, mono read-outs.
- Effects to use somewhere on the page: kinetic typography, glassmorphism, claymorphism, pixel art, paper cutout,
  Bauhaus shapes, flow fields, ASCII art, risograph treatment. Give every section a different idea.

## Engineering rules
- Vite + React + TypeScript. React Three Fiber or plain canvas for backgrounds. `motion` (from `motion/react`).
  Pin exact versions.
- Wrap every canvas in a lazy mount (IntersectionObserver) and never run more than about three WebGL contexts at once.
  Decorative backgrounds must not block touch scrolling. Respect `prefers-reduced-motion`.
- Do not copy code out of the Devora repo into the marketing site verbatim; read it for facts and patterns.
- Do not delete files. Do not commit or push unless I ask. Keep a running log in `notes/progress.md`.
- If a step fails twice, stop and tell me what you tried.

## Done means
- Opened in headless Chromium, scrolled top to bottom, **a screenshot of every section was actually looked at**,
  and there are no console errors.
- Mobile (390px) has no horizontal overflow.
- Tests, lint and `npm run build` pass.
- **Published as an Artifact** (multi-file via `files`) so I can open it from a link. Do not just tell me to run
  `npm run dev`.
- Your report lists what is **unverified** (for example real-GPU performance), not only what worked.

Before you start building, show me the Devora brief and a one-paragraph plan of the scenes, and wait for my OK.
