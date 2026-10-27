Attach the GitHub repo `CapChris20/devora` (add_repo, then clone it) and read it first: README, package.json, folders, main source,
docs, screenshots, any DESIGN.md. Write `notes/devora-brief.md` with what Devora is, who it's for, its 3-5 strongest
features (real names, real numbers), and what's unfinished. Use only facts from the repo; if something is unclear, ask me.

Then build a cinematic, scroll-driven marketing site for Devora in the same spirit as the ShaderXD prototype I just had
you make: a real multi-section site with motion, not a single page and not a dashboard. Same framing, animation and
styling, but all content comes from Devora.

FRAMING (adapt the content, keep the shape)
1. Hero: full-bleed live animated background (shader or canvas that moves with scroll), giant kinetic headline mixing a heavy
   grotesk with an italic serif accent word, one-line pitch, one gradient primary button + one ghost button, scroll cue.
2. Pinned scroll reel: sticky stage inside a tall section. Scrolling picks the scene and drives its motion. One scene per
   real Devora feature, each with a different background visual, a mono HUD label, a big caption, progress ticks, and a
   chunky wipe between scenes.
3. Gallery/showcase: Devora's features, projects or modules as tactile cards (risograph-print look, hover reveals true colour).
   If the repo has screenshots or a demo, use those real assets. Never recreate them.
4. Interactive section: the working heart of Devora (a live demo or the real UI) on a glass panel.
5. How it works: three steps with bold geometric shapes that parallax on scroll.
6. Why: the problem it solves, ambient flow-field canvas behind translucent cards.
7. Footer: one huge CTA over an animated ASCII scene.
Alternate dark and light sections (torn paper-cutout edges between them) so the page has rhythm.

ANIMATION
- Kinetic typography: per-letter spring reveal, small hover wobble.
- Scroll-scrubbed backgrounds: scroll position drives the animation's time.
- Parallax shapes with `useScroll`, a hard stepped wipe between reel scenes, progress ticks and a bar.
- Ambient only: flow field, ASCII sun. Nothing loops loudly beyond that.

STYLING
- Palette and surfaces from Devora's own DESIGN.md if it has one. Otherwise: background #0a0a0f, surface #141419, pink #ff6b9d,
  orange #f97316, cyan #06b6d4, text #f5f2fa, primary button gradient #be185d -> #c2410c.
- Gradient text: headlines use a vertical top-lit white gradient; accent words use light pink -> pink -> orange; numerals and
  panel titles use a 120deg pink -> orange gradient; a short pink -> orange -> cyan rule under each section title.
- Depth from dark layered shadows and a 1px top highlight. No gray-pink washed look, no neon glow on text or buttons,
  no rainbow palettes, no default blue/purple. Keep colours saturated.
- Fonts bundled via @fontsource (no CDN): heavy grotesk + italic serif + mono for HUD labels.
- Chrome: corner-bracket frames, numbered kickers like `// 03 · THE DEMO`, mono read-outs, glass nav, pixel-art logo.
- Use these effects across sections: kinetic type, glassmorphism, claymorphism, pixel art, paper cutout, Bauhaus shapes,
  flow fields, ASCII art, risograph cards. Every section gets a different visual idea.

ENGINEERING
- Vite + React + TypeScript, motion (from `motion/react`), R3F or plain canvas for backgrounds. Pin exact versions.
- Wrap every canvas in an IntersectionObserver lazy mount; at most about 3 live WebGL contexts. Decorative canvases must not
  block touch scrolling. Respect prefers-reduced-motion.
- Don't copy code out of the Devora repo; read it for facts. Don't delete files. Don't commit or push unless I ask.
  Keep a running log in notes/progress.md. If a step fails twice, stop and tell me what you tried.

DONE MEANS
- Headless-Chromium scroll top to bottom, a screenshot of EVERY section looked at, no console errors, 390px width has no
  horizontal overflow, tests/lint/build pass.
- Published as an Artifact (multi-file via `files`) so I can open it from a link, not "run npm run dev".
- Your report says what's unverified (e.g. real-GPU performance), not only what worked.

Before building, show me the Devora brief and a one-paragraph scene plan and wait for my OK.
