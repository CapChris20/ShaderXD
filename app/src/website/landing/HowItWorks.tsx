// How-it-works steps over a live isometric gradient field, then “why” cards over a flow field.
// Flow: isometric canvas behind three steps → flow-field backdrop + audience cards.
// Used by: Landing after the gallery.

import { KineticText } from '../visual-effects/KineticText'
import { FlowField } from '../visual-effects/FlowField'
import { MountWhenVisible } from '../visual-effects/MountWhenVisible'
import { IsometricBackground } from '../visual-effects/backgrounds/IsometricBackground'

// ===== NAMED CONSTANTS =====

const STEPS = [
  {
    n: '01',
    title: 'Find',
    body: 'Browse by look: space, glass, fire, neon, liquid, glitch. Every one is a live shader, not a screenshot.',
    shape: 'circle',
  },
  {
    n: '02',
    title: 'Customize',
    body: 'Uniforms become controls. Floats turn into sliders, colors into pickers, booleans into toggles. No GLSL required.',
    shape: 'square',
  },
  {
    n: '03',
    title: 'Export',
    body: 'Copy a React component with your exact values baked in. Vue, Svelte and npm are next on the list.',
    shape: 'triangle',
  },
] as const

const WHY_AUDIENCES = [
  {
    who: 'Developers',
    text: 'Want a glowing background or a glass effect. Can’t read GLSL. Shadertoy has the shader but no export path.',
  },
  {
    who: 'Designers',
    text: 'Love a shader, but the colors fight the brand. Now the palette is two color pickers.',
  },
  {
    who: 'Shader artists',
    text: 'Make beautiful things with nowhere to sell them. A marketplace is the end goal; this is the first mile.',
  },
] as const

const ISO_LAZY_MARGIN = '100px'
const FLOW_FIELD_LAZY_MARGIN = '100px'

const STEPS_TITLE_LINES = [[{ t: 'Three moves.' }], [{ t: 'Zero GLSL.', cls: 'serif' }]]

const WHY_TITLE_LINES = [
  [{ t: 'Shadertoy has the shaders. ' }, { t: 'Nobody has the export.', cls: 'serif neon-text' }],
]

// ===== MAIN FUNCTION =====

/**
 * How it works: isometric gradient city behind the three steps, then the why band.
 */
export function HowItWorks() {
  const stepArticles = STEPS.map((step) => (
    <article key={step.n} className="step">
      <span className={`mark ${step.shape}`} aria-hidden />
      <span className="num">{step.n}</span>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
    </article>
  ))

  const whyCards = WHY_AUDIENCES.map((item) => (
    <article key={item.who} className="glass why-card">
      <h3>{item.who}</h3>
      <p>{item.text}</p>
    </article>
  ))

  return (
    <>
      <section id="how" className="bauhaus">
        <div className="how-canvas" aria-hidden>
          <MountWhenVisible margin={ISO_LAZY_MARGIN}>
            <IsometricBackground />
          </MountWhenVisible>
        </div>
        <div className="bh-inner">
          <p className="mono kicker light">// 04 · HOW IT WORKS</p>
          <KineticText as="h2" className="sec-title" lines={STEPS_TITLE_LINES} />
          <div className="steps">{stepArticles}</div>
        </div>
      </section>

      <section className="why">
        <div className="why-canvas">
          <MountWhenVisible margin={FLOW_FIELD_LAZY_MARGIN}>
            <FlowField className="fill" />
          </MountWhenVisible>
        </div>
        <div className="why-inner">
          <p className="mono kicker light">// 05 · WHY</p>
          <KineticText as="h2" className="sec-title" lines={WHY_TITLE_LINES} />
          <div className="why-grid">{whyCards}</div>
        </div>
      </section>
    </>
  )
}
