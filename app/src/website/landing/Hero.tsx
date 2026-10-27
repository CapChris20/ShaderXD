// Full-viewport home hero with glowing-orb shader and primary CTAs.
// Flow: scroll-linked shader travel → kinetic headline → browse / sandbox links.
// Used by: landing page at `#top`.

import { ShaderView } from '../../copy-as-react/shaderViewTemplate'
import { defaultsOf, getShader } from '../../shader-catalog'
import { KineticText } from '../visual-effects/KineticText'
import { MountWhenVisible } from '../visual-effects/MountWhenVisible'
import { PixelSprite } from '../visual-effects/PixelSprite'
import { SPRITES } from '../visual-effects/sprites'
import { useScrollTravel } from '../visual-effects/useScrollTravel'

// ===== NAMED CONSTANTS =====

const HERO_SHADER_ID = 'glowing-orb'
const SCROLL_TRAVEL_MULTIPLIER = 0.012
const HERO_SHADER_DPR: [number, number] = [0.75, 1.25]
const STAR_SPRITE_SCALE = 3
const ARROW_SPRITE_SCALE = 2
const TITLE_MOUNT_DELAY = 0.15

const heroShader = getShader(HERO_SHADER_ID)
const heroShaderParams = { ...defaultsOf(heroShader), u_speed: 1.0 }

const HERO_TITLE_LINES = [
  [{ t: 'THE ', cls: '' }, { t: 'npm', cls: 'mono-tag' }],
  [{ t: 'FOR ' }, { t: 'shaders', cls: 'serif neon-text' }],
]

type HeroProps = { count: number }

// ===== MAIN FUNCTION =====

export function Hero({ count }: HeroProps) {
  const scrollTravelRef = useScrollTravel(SCROLL_TRAVEL_MULTIPLIER)
  const metaHudText = ` // SHADERXD 0.1 · ${count} SHADERS · REACT EXPORT`

  const frameCorners = (
    <>
      <i />
      <i />
      <i />
      <i />
    </>
  )

  const metaLine = (
    <>
      <PixelSprite {...SPRITES.star} scale={STAR_SPRITE_SCALE} label="" />
      {metaHudText}
    </>
  )

  return (
    <section id="top" className="hero">
      <div className="hero-bg">
        <MountWhenVisible>
          <ShaderView
            fragment={heroShader.fragment}
            params={heroShaderParams}
            bloom={heroShader.bloom}
            travelOffset={scrollTravelRef}
            interactive={false}
            dpr={HERO_SHADER_DPR}
          />
        </MountWhenVisible>
      </div>
      <div className="hero-shade" />
      <div className="frame" aria-hidden>
        {frameCorners}
      </div>

      <div className="hero-copy">
        <p className="mono hero-meta">{metaLine}</p>
        <KineticText as="h1" trigger="mount" className="hero-title" delay={TITLE_MOUNT_DELAY} lines={HERO_TITLE_LINES} />
        <p className="hero-sub">
          Find any animated shader. Bend its colors, speed and glow with plain controls. Export a React component in seconds.
        </p>
        <div className="hero-cta">
          <a href="#gallery" className="neon-btn">
            Browse shaders
          </a>
          <a href="#sandbox" className="ghost-btn">
            Open sandbox
          </a>
        </div>
      </div>
      <div className="scroll-cue mono">
        SCROLL <PixelSprite {...SPRITES.arrow} scale={ARROW_SPRITE_SCALE} label="" className="rot" />
      </div>
    </section>
  )
}
