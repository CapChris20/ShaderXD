// Paper-cut gallery grid with risograph-style shader preview cards.
// Flow: torn sheet edges → title block → map shaders to clickable cards.
// Used by: HomePage (`#gallery`) and opens sandbox via `onOpen`.

import { useMemo } from 'react'
import { shaders } from '../../shader-catalog'
import { KineticText } from '../visual-effects/KineticText'
import { tornEdge } from '../visual-effects/tornPaper'

// ===== NAMED CONSTANTS =====

const GALLERY_TITLE_LINES = [[{ t: 'Pick a look. ' }, { t: 'Steal the code.', cls: 'serif' }]]

const TORN_EDGE_SEEDS = [7, 31, 77] as const
const TORN_EDGE_AMPLITUDES = [22, 18, 14] as const

type ShaderGalleryProps = { onOpen: (shaderId: string) => void; limit?: number }

// ===== HELPER FUNCTIONS =====

function thumbUrl(shaderId: string) {
  return `${import.meta.env.BASE_URL}thumbs/${shaderId}.jpg`
}

function cardTiltDegrees(cardIndex: number) {
  return ((cardIndex % 3) - 1) * 0.9
}

// ===== MAIN FUNCTION =====

/** Paper cutout: stacked, torn sheets with hard offset shadows. Cards reveal true colour on hover. */
export function ShaderGallery({ onOpen, limit }: ShaderGalleryProps) {
  const tornEdges = useMemo(
    () => [
      tornEdge(TORN_EDGE_SEEDS[0], TORN_EDGE_AMPLITUDES[0]),
      tornEdge(TORN_EDGE_SEEDS[1], TORN_EDGE_AMPLITUDES[1]),
      tornEdge(TORN_EDGE_SEEDS[2], TORN_EDGE_AMPLITUDES[2]),
    ],
    [],
  )

  const visibleShaders = shaders.slice(0, limit ?? shaders.length)

  const cardButtons = visibleShaders.map((shaderDef, cardIndex) => {
    const tiltStyle = { ['--tilt' as string]: `${cardTiltDegrees(cardIndex)}deg` }
    const previewSrc = thumbUrl(shaderDef.id)

    return (
      <button key={shaderDef.id} className="riso-card" style={tiltStyle} onClick={() => onOpen(shaderDef.id)}>
        <div className="riso-art">
          <img className="duo" src={previewSrc} alt="" loading="lazy" />
          <img className="true" src={previewSrc} alt={`${shaderDef.name} preview`} loading="lazy" />
          <span className="screen" />
        </div>
        <div className="riso-meta">
          <span className="stamp mono">{shaderDef.category}</span>
          <h3>{shaderDef.name}</h3>
          <p>{shaderDef.description}</p>
          <span className="open mono">Open in sandbox →</span>
        </div>
      </button>
    )
  })

  return (
    <section id="gallery" className="paper">
      <div className="sheet s1" style={{ clipPath: tornEdges[0] }} />
      <div className="sheet s2" style={{ clipPath: tornEdges[1] }} />
      <div className="sheet s3" style={{ clipPath: tornEdges[2] }}>
        <div className="paper-inner">
          <p className="mono kicker">// 02 · THE LIBRARY</p>
          <KineticText as="h2" className="sec-title ink" lines={GALLERY_TITLE_LINES} />
          <p className="sec-sub">
            Every shader is original GLSL with live controls and a React export. Hover a print to see it in full colour.
          </p>
          <div className="riso-grid">{cardButtons}</div>
          <p className="gallery-more">
            <a href="#discover" className="neon-btn">
              See the full library
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
