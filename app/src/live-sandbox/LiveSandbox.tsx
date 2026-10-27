// The working sandbox: pick a shader, tweak controls, open Export.
// Flow: chip gallery → live preview → controls panel → export button.
// Used by: website/sandbox-page/OpenLiveSandbox.

import { ShaderControls } from './ShaderControls'
import { ShaderView } from '../copy-as-react/shaderViewTemplate'
import { shaders } from '../shader-catalog'
import type { ParamValue, ParamValues, ShaderDef } from '../shader-catalog/types'
import { MountWhenVisible } from '../website/visual-effects/MountWhenVisible'

type Props = {
  shader: ShaderDef
  values: ParamValues
  onSelect: (id: string) => void
  onChange: (name: string, value: ParamValue) => void
  onReset: () => void
  onExport: () => void
}

/**
 * LiveSandbox stage with clay chips, live canvas, and glass control panel.
 */
export function LiveSandbox({ shader, values, onSelect, onChange, onReset, onExport }: Props) {
  const previewLabel = `${shader.name} preview`

  return (
    <section id="sandbox" className="sandbox">
      <nav className="sb-chips" aria-label="Choose shader">
        {shaders.map((entry) => {
          const isSelected = entry.id === shader.id
          const chipClassName = isSelected ? 'clay-chip on' : 'clay-chip'
          return (
            <button
              key={entry.id}
              type="button"
              className={chipClassName}
              aria-pressed={isSelected}
              onClick={() => onSelect(entry.id)}
            >
              {entry.name}
            </button>
          )
        })}
      </nav>

      <div className="sb-stage">
        <div className="sb-canvas" aria-label={previewLabel}>
          <MountWhenVisible margin="100px">
            <ShaderView fragment={shader.fragment} params={values} bloom={shader.bloom} />
          </MountWhenVisible>
          <div className="frame" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </div>
          <p className="mono sb-hint">HOLD + DRAG TO LOOK AROUND</p>
        </div>

        <aside className="glass sb-panel" aria-label="Controls">
          <span className="stamp mono">{shader.category}</span>
          <h3>{shader.name}</h3>
          <p className="desc">{shader.description}</p>
          <ShaderControls
            controls={shader.uniforms}
            values={values}
            onChange={onChange}
            onReset={onReset}
          />
          <button type="button" className="neon-btn wide" onClick={onExport}>
            Export React component
          </button>
        </aside>
      </div>
    </section>
  )
}
