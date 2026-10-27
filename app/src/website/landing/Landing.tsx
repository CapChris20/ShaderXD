// Landing page stacking hero, reel, gallery, how-it-works, and creator pitch.
// Flow: render sections top to bottom → pass `onOpen` into gallery cards.
// Used by: WebsiteApp when the route is `home`.

import { shaders } from '../../shader-catalog'
import { SiteFooter } from '../top-bar-and-footer/SiteFooter'
import { KineticText } from '../visual-effects/KineticText'
import { ShaderGallery } from './ShaderGallery'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { ScrollReel } from './ScrollReel'

// ===== NAMED CONSTANTS =====

const GALLERY_PREVIEW_LIMIT = 6

const CREATOR_PITCH_LINES = [
  [{ t: 'Sell your shaders. ' }, { t: 'Keep 70%.', cls: 'serif' }],
]

type LandingProps = { onOpen: (shaderId: string) => void }

// ===== MAIN FUNCTION =====

export function Landing({ onOpen }: LandingProps) {
  const shaderCount = shaders.length

  return (
    <>
      <Hero count={shaderCount} />
      <ScrollReel />
      <ShaderGallery onOpen={onOpen} limit={GALLERY_PREVIEW_LIMIT} />
      <HowItWorks />
      <section className="sell">
        <div className="sell-panel">
          <p className="mono kicker">// 06 · FOR CREATORS</p>
          <KineticText as="h2" className="sec-title" lines={CREATOR_PITCH_LINES} />
          <p className="sell-sub">
            Upload your GLSL, set a price from $1.99 to $29.99, and get paid weekly. The marketplace is the end goal;
            this page shows how it will work.
          </p>
          <div className="cta-row">
            <a href="#creators" className="neon-btn">
              Start selling
            </a>
            <a href="#pricing" className="ghost-btn">
              See plans
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  )
}
