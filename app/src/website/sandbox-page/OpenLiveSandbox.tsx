// LiveSandbox route wrapper: page band, live editor, and site footer.
// Flow: render band with liquid-morph defaults → mount LiveSandbox tool → footer links.
// Used by: WebsiteApp when the route is `sandbox`.

import type { ComponentProps } from 'react'
import { LiveSandbox } from '../../live-sandbox/LiveSandbox'
import { SiteFooter } from '../top-bar-and-footer/SiteFooter'
import { PageHeader } from '../top-bar-and-footer/PageHeader'

// ===== NAMED CONSTANTS =====

const SANDBOX_BAND_SHADER_ID = 'liquid-morph'

// ===== MAIN FUNCTION =====

export function OpenLiveSandbox(props: ComponentProps<typeof LiveSandbox>) {
  return (
    <>
      <PageHeader
        shaderId={SANDBOX_BAND_SHADER_ID}
        title="The"
        accent="sandbox"
        sub="Pick a shader, change its colours and speed, and copy working React code that matches what you see."
      />
      <LiveSandbox {...props} />
      <SiteFooter />
    </>
  )
}
