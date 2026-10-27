// Hero band at the top of inner pages with live shader or custom background.
// Flow: resolve shader defaults → lazy-mount background → kinetic title + subtitle.
// Used by: BrowseShaders, SellShaders, PickAPlan, MakeAccount, and LiveSandbox page headers.

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { ShaderView } from '../../copy-as-react/shaderViewTemplate'
import { defaultsOf, getShader } from '../../shader-catalog'
import { KineticText } from '../visual-effects/KineticText'
import { MountWhenVisible } from '../visual-effects/MountWhenVisible'

// ===== NAMED CONSTANTS =====

const DEFAULT_SHADER_BAND_DPR: [number, number] = [0.6, 1]
const BAND_LAZY_MARGIN = '0px'

type PageBandProps = {
  shaderId?: string
  bg?: ReactNode
  title: string
  accent: string
  sub: string
  children?: ReactNode
}

// ===== HELPER FUNCTIONS =====

function buildTitleLines(title: string, accent: string) {
  return [[{ t: `${title} ` }, { t: accent, cls: 'serif' }]]
}

// ===== MAIN FUNCTION =====

/** Every page opens on its own live shader band with a kinetic title. */
export function PageHeader({ shaderId, bg, title, accent, sub, children }: PageBandProps) {
  const shaderDef = getShader(shaderId ?? '')
  const defaultParams = useMemo(() => defaultsOf(shaderDef), [shaderDef])
  const titleLines = buildTitleLines(title, accent)

  const defaultBackground = (
    <ShaderView
      fragment={shaderDef.fragment}
      params={defaultParams}
      bloom={shaderDef.bloom}
      interactive={false}
      dpr={DEFAULT_SHADER_BAND_DPR}
    />
  )

  const backgroundNode = bg ?? defaultBackground
  const frameCorners = (
    <>
      <i />
      <i />
      <i />
      <i />
    </>
  )

  return (
    <section className="pband">
      <div className="pband-bg">
        <MountWhenVisible margin={BAND_LAZY_MARGIN}>{backgroundNode}</MountWhenVisible>
      </div>
      <div className="pband-scrim" />
      <div className="frame" aria-hidden>
        {frameCorners}
      </div>
      <div className="pband-in">
        <KineticText as="h1" trigger="mount" className="pband-title" lines={titleLines} />
        <p className="pband-sub">{sub}</p>
        {children}
      </div>
    </section>
  )
}
