# ShaderXD Coding Style Guide

Follow **CODING_STYLE.md (Variation 3)** for TypeScript and React:

- Plain-English names. One function, one job.
- File shape: header → named constants → helpers → main (numbered `// 1.`–`// 6.`).
- Nesting max 2. Failures first, happy path last.
- Same behavior: routes, shader ids, uniform letters, export shape, CSS class names.

## Folder + file names (spoken English)

```
app/src/
  shader-catalog/                 all the GLSL shaders (neon-grid-horizon.ts, …)
  read-uniforms/readUniforms.ts   turn uniforms into sliders/pickers
  copy-as-react/
    CopyAsReactModal.tsx
    makeReactExport.ts
    shaderViewTemplate.tsx
  live-sandbox/
    LiveSandbox.tsx
    ShaderControls.tsx
    FullWindowPreview.tsx
  website/
    WebsiteApp.tsx
    landing/Landing.tsx, Hero.tsx, ScrollReel.tsx, ShaderGallery.tsx, HowItWorks.tsx
    browse-shaders/BrowseShaders.tsx
    sell-shaders/SellShaders.tsx
    pick-a-plan/PickAPlan.tsx
    make-account/MakeAccount.tsx
    sandbox-page/OpenLiveSandbox.tsx
    top-bar-and-footer/TopBar.tsx, SiteFooter.tsx, PageHeader.tsx
    go-to-page/useGoToPage.ts
    mock-prices/mockPrices.ts
    visual-effects/… MountWhenVisible, KineticText, backgrounds/…
```
