// Scroll-scrubbed shader reel pinned while the user scrolls through scenes.
// Flow: measure section scroll progress → pick scene index → drive shader time via ref.
// Used by: HomePage between hero and gallery.

import { useEffect, useRef, useState } from 'react'
import { ShaderView } from '../../copy-as-react/shaderViewTemplate'
import { defaultsOf, getShader } from '../../shader-catalog'
import { KineticText } from '../visual-effects/KineticText'
import { MountWhenVisible } from '../visual-effects/MountWhenVisible'

// ===== NAMED CONSTANTS =====

const REEL_SCENE_SPECS = [
  { id: 'liquid-morph', line: 'Shapes that never settle.' },
  { id: 'holographic-foil', line: 'Light that changes its mind.' },
  { id: 'particle-swarm', line: 'Seventy tiny decisions.' },
  { id: 'metaballs', line: 'Everything wants to merge.' },
  { id: 'fractal-bulb', line: 'Infinity, ray-marched.' },
  { id: 'glitch-block', line: 'Beautifully broken.' },
] as const

const REEL_HEIGHT_VH_PER_SCENE = 120
const REEL_TRAVEL_SECONDS = 60
const REEL_CANVAS_DPR: [number, number] = [0.7, 1.1]
const REEL_LAZY_MARGIN = '0px'
const PROGRESS_CLAMP_MAX = 0.9999

const REEL_SCENES = REEL_SCENE_SPECS.map((spec) => {
  const shaderDef = getShader(spec.id)
  return { ...spec, shader: shaderDef, params: defaultsOf(shaderDef) }
})

// ===== HELPER FUNCTIONS =====

/** Scroll progress through a tall pinned section (0 at enter, ~1 at exit). */
function scrollProgressThroughSection(sectionTop: number, sectionHeight: number, viewportHeight: number) {
  const scrollableDistance = sectionHeight - viewportHeight
  const rawProgress = -sectionTop / scrollableDistance
  return Math.min(PROGRESS_CLAMP_MAX, Math.max(0, rawProgress))
}

function padSceneNumber(value: number) {
  return String(value).padStart(2, '0')
}

// ===== MAIN FUNCTION =====

/**
 * A pinned, scroll-scrubbed reel: scroll position picks the shader and drives its time,
 * so the animation plays as you scroll, like a frame sequence but live.
 */
export function ScrollReel() {
  const sectionRef = useRef<HTMLElement>(null)
  const travelTimeRef = useRef(0)
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const sectionElement = sectionRef.current
      if (!sectionElement) return

      // 1. Measure how far we have scrolled through the pinned section.
      const bounds = sectionElement.getBoundingClientRect()
      const progress = scrollProgressThroughSection(bounds.top, bounds.height, window.innerHeight)

      // 2. Map progress to shader time and the active scene index.
      travelTimeRef.current = progress * REEL_TRAVEL_SECONDS
      setActiveSceneIndex(Math.floor(progress * REEL_SCENES.length))
      setScrollProgress(progress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const activeScene = REEL_SCENES[activeSceneIndex]
  const sectionHeightStyle = { height: `${REEL_SCENES.length * REEL_HEIGHT_VH_PER_SCENE}vh` }
  const progressBarStyle = { transform: `scaleX(${scrollProgress})` }

  const hudSceneLabel = `// SCENE ${padSceneNumber(activeSceneIndex + 1)} / ${padSceneNumber(REEL_SCENES.length)}`
  const hudCategory = activeScene.shader.category.toUpperCase()

  const uniformHudSpans = activeScene.shader.uniforms.slice(0, 4).map((uniform) => {
    const displayValue = String(uniform.default)
    return (
      <span key={uniform.name} className="dim">
        {uniform.name} {displayValue}
      </span>
    )
  })

  const tickItems = REEL_SCENES.map((scene, index) => {
    let tickClass = ''
    if (index === activeSceneIndex) tickClass = 'on'
    else if (index < activeSceneIndex) tickClass = 'done'
    return <li key={scene.id} className={tickClass} />
  })

  const captionLines = [
    [{ t: activeScene.shader.name.toUpperCase() }],
    [{ t: activeScene.line, cls: 'serif' }],
  ]

  const frameCorners = (
    <>
      <i />
      <i />
      <i />
      <i />
    </>
  )

  return (
    <section id="reel" ref={sectionRef} className="reel" style={sectionHeightStyle}>
      <div className="reel-stick">
        <div className="reel-canvas">
          <MountWhenVisible margin={REEL_LAZY_MARGIN}>
            <ShaderView
              fragment={activeScene.shader.fragment}
              params={activeScene.params}
              bloom={activeScene.shader.bloom}
              travelOffset={travelTimeRef}
              interactive={false}
              dpr={REEL_CANVAS_DPR}
            />
          </MountWhenVisible>
        </div>
        <div key={activeScene.id} className="wipe" aria-hidden />
        <div className="frame" aria-hidden>
          {frameCorners}
        </div>

        <div className="reel-hud mono" aria-hidden>
          <span>{hudSceneLabel}</span>
          <span>{hudCategory}</span>
          {uniformHudSpans}
        </div>

        <div className="reel-caption">
          <KineticText key={activeScene.id} as="h2" trigger="mount" className="reel-title" lines={captionLines} />
        </div>

        <ol className="reel-ticks" aria-hidden>
          {tickItems}
        </ol>
        <div className="reel-bar" aria-hidden>
          <span style={progressBarStyle} />
        </div>
      </div>
    </section>
  )
}
