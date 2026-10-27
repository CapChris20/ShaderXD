// Site footer with ASCII liquid-chrome shader, kinetic headline, and hash links.
// Flow: lazy-mount shader background → kinetic title → sandbox CTA → link row.
// Used by: Landing, BrowseShaders, SellShaders, PickAPlan, MakeAccount, and LiveSandbox pages.

import { useMemo } from 'react'
import { ShaderView } from '../../copy-as-react/shaderViewTemplate'
import { defaultsOf, getShader } from '../../shader-catalog'
import { KineticText } from '../visual-effects/KineticText'
import { MountWhenVisible } from '../visual-effects/MountWhenVisible'
import { PixelSprite } from '../visual-effects/PixelSprite'
import { SPRITES } from '../visual-effects/sprites'

// ===== NAMED CONSTANTS =====

const FOOTER_SHADER_ID = 'ascii-liquid-chrome'
const FOOTER_LAZY_MARGIN = '100px'
const FOOTER_SHADER_DPR: [number, number] = [0.6, 1.1]
const FLOWER_SPRITE_SCALE = 3

const FOOTER_TITLE_LINES = [
  [{ t: 'Ship something' }],
  [{ t: 'that moves.', cls: 'serif neon-text' }],
]

const footerShader = getShader(FOOTER_SHADER_ID)

// ===== MAIN FUNCTION =====

export function SiteFooter() {
  const shaderParams = useMemo(
    () => ({ ...defaultsOf(footerShader), u_speed: 0.7, u_rows: 56 }),
    [],
  )

  return (
    <footer className="footer">
      <div className="ascii">
        <MountWhenVisible margin={FOOTER_LAZY_MARGIN}>
          <ShaderView
            fragment={footerShader.fragment}
            params={shaderParams}
            bloom={footerShader.bloom}
            interactive={false}
            dpr={FOOTER_SHADER_DPR}
          />
        </MountWhenVisible>
      </div>
      <div className="footer-inner">
        <KineticText as="h2" className="foot-title" lines={FOOTER_TITLE_LINES} />
        <a href="#sandbox" className="clay-btn big">
          Open the sandbox
        </a>
        <nav className="mono foot-links" aria-label="Footer">
          <a href="#discover">Discover</a>
          <a href="#sandbox">Sandbox</a>
          <a href="#creators">Creators</a>
          <a href="#pricing">Pricing</a>
          <a href="#signup">Sign up</a>
        </nav>
        <p className="mono fine">
          <PixelSprite {...SPRITES.flower} scale={FLOWER_SPRITE_SCALE} label="" /> SHADERXD ·
          PROTOTYPE · ORIGINAL GLSL · REACT EXPORT ONLY (FOR NOW)
        </p>
      </div>
    </footer>
  )
}
