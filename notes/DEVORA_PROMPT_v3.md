Attach the GitHub repo `CapChris20/devora` (add_repo, then clone it) and read it first: README, package.json, folders, main source,
docs, screenshots, any DESIGN.md. Write `notes/devora-brief.md` with what Devora is, who it's for, its 3-5 strongest
features (real names, real numbers), and what's unfinished. Use only facts from the repo; if something is unclear, ask me.

Then build a cinematic, scroll-driven, MULTI-PAGE marketing site for Devora in the same spirit as the ShaderXD prototype
(https://claude.ai/artifact/2Rpj4vn9bhF25EjXsYoatJ): same framing, animation and styling, but all content comes from Devora.
It must be a real site with several pages, not one long page and not a dashboard.

PAGES (hash routing: #home, #discover, #sandbox, #creators, #pricing, #signup; adapt, rename or drop pages to fit what Devora
really is, and tell me what you changed in the brief)
- Home: hero, pinned scroll reel, featured showcase cards, how-it-works, why, a "for creators / for teams" panel, footer.
- Discover: a searchable, filterable library of Devora's real things (features, modules, templates, whatever the repo has),
  category pills, a "free only" style toggle if it makes sense, result count, empty state, click-through to the demo page.
- Sandbox/Demo: the working heart of Devora on its own page: a live preview, controls, and an export or copy-code panel.
- Creators (or Community/Teams): a form with validation, plus a clearly labelled example-data dashboard
  (stats, a bar chart, a table).
- Pricing: three plan tiers (one highlighted with a gradient border), a compare-plans table, an FAQ accordion.
  Only include this if Devora actually has plans; otherwise replace it with the page that fits (docs, roadmap, changelog).
- Sign up: a single card form with validation.
Shared: glass nav with aria-current on the active page and a gradient Sign up button, a footer with the same links, document
title per page, scroll to top on route change, unknown hash falls back to home.
EVERY page opens on its own live animated band (a different background per page) with a kinetic title and a one-line sub.
Anything not really built (accounts, payments, uploads) must say "Prototype only" in the UI and do nothing real.
Mock data must be labelled "Example data". No invented customers, numbers or testimonials.

HOME FRAMING (adapt content, keep shape)
1. Hero: full-bleed live animated background that moves with scroll, giant kinetic headline mixing a heavy grotesk with an
   italic serif accent word, one-line pitch, gradient primary button + ghost button, scroll cue.
2. Pinned scroll reel: sticky stage in a tall section; scrolling picks the scene and drives its motion; one scene per real
   Devora feature, each with a different visual, a mono HUD label, a big caption, progress ticks and a chunky stepped wipe.
3. Showcase cards (risograph-print look, hover reveals true colour). Use real screenshots or demo assets from the repo, never
   recreations.
4. How it works: three steps, bold geometric shapes with scroll parallax.
5. Why: the problem it solves, ambient flow-field canvas behind translucent cards.
6. Footer: huge CTA over an animated ASCII scene.
Alternate dark and light sections (torn paper-cutout edges) for rhythm.

ANIMATION
Per-letter kinetic type with spring reveal; scroll-scrubbed backgrounds; parallax shapes with `useScroll`; stepped wipe between
reel scenes; a short fade-in on each route change. Ambient loops only for the flow field and the ASCII sun.

STYLING
- Palette and surfaces from Devora's own DESIGN.md if it has one. Otherwise: background #0a0a0f, surface #141419, pink #ff6b9d,
  orange #f97316, cyan #06b6d4, text #f5f2fa, primary button gradient #be185d -> #c2410c.
- Gradient text: headlines use a vertical top-lit white gradient; accent words light pink -> pink -> orange; numerals and panel
  titles a 120deg pink -> orange gradient; a short pink -> orange -> cyan rule under section titles.
- Depth from dark layered shadows and a 1px top highlight. NO gray-pink washed look, NO neon glow on text or buttons, no rainbow
  palettes, no default blue/purple. Keep colours saturated.
- Fonts bundled via @fontsource (no CDN): heavy grotesk + italic serif + mono for HUD labels.
- Chrome: corner-bracket frames, numbered kickers like `// 03 · THE DEMO`, mono read-outs, glass nav, pixel-art logo.
- Use these effects across the site: kinetic type, glassmorphism, claymorphism, pixel art, paper cutout, Bauhaus shapes, flow
  fields, ASCII art, risograph cards. Every section gets a different visual idea.

ENGINEERING
- Vite + React + TypeScript, motion (from `motion/react`), R3F or plain canvas for backgrounds. Pin exact versions.
- Only the current page's canvases are mounted. Wrap every canvas in an IntersectionObserver lazy mount; at most about 3 live
  WebGL contexts. Decorative canvases must not block touch scrolling. Respect prefers-reduced-motion.
- Don't copy code out of the Devora repo; read it for facts. Don't delete files. Don't commit or push unless I ask.
  Keep a running log in notes/progress.md. If a step fails twice, stop and tell me what you tried.

DONE MEANS
- Headless-Chromium visit to EVERY page and a scroll through Home, a screenshot of every section looked at, no console errors.
- Interaction tests: search, filters, click-through, form validation, FAQ accordion, nav aria-current, route fallback.
- 390px width has no horizontal overflow on any page. Tests, lint and build pass.
- Published as an Artifact (multi-file via `files`) so I can open it from a link, not "run npm run dev".
- Your report says what's unverified (e.g. real-GPU performance), not only what worked.

Before building, show me the Devora brief, the page list and a one-paragraph scene plan, and wait for my OK.
