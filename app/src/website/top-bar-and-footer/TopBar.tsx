// Top glass navigation bar with logo and hash links.
// Flow: render brand + main links + sign-up CTA; mark the current route.
// Used by: WebsiteApp on every page.

import { PixelSprite } from '../visual-effects/PixelSprite'
import { SPRITES } from '../visual-effects/sprites'
import type { Route } from '../go-to-page/useGoToPage'

// ===== NAMED CONSTANTS =====

const MAIN_LINKS: [Route, string][] = [
  ['home', 'Home'],
  ['discover', 'Discover'],
  ['sandbox', 'Sandbox'],
  ['creators', 'Creators'],
  ['pricing', 'Pricing'],
]

const LOGO_SCALE = 4

type TopBarProps = { route: Route }

// ===== MAIN FUNCTION =====

/** Glass nav: blurred, translucent, hairline border. Marks the current page. */
export function TopBar({ route }: TopBarProps) {
  const linkItems = MAIN_LINKS.map(([routeId, label]) => {
    const isCurrentPage = route === routeId
    return (
      <a key={routeId} href={`#${routeId}`} aria-current={isCurrentPage ? 'page' : undefined}>
        {label}
      </a>
    )
  })

  const signupIsCurrent = route === 'signup'

  return (
    <header className="nav glass">
      <a href="#home" className="nav-brand" aria-label="ShaderXD home">
        <PixelSprite {...SPRITES.logo} scale={LOGO_SCALE} label="ShaderXD pixel logo" />
        <span>
          Shader<b>XD</b>
        </span>
      </a>
      <nav className="nav-links mono" aria-label="Main">
        {linkItems}
      </nav>
      <a href="#signup" className="neon-btn small" aria-current={signupIsCurrent ? 'page' : undefined}>
        Sign up
      </a>
    </header>
  )
}
