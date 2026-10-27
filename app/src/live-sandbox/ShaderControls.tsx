// Slider / color / toggle controls parsed from a shader's uniforms.
// Flow: for each control → pick the right input → call onChange with the live value.
// Used by: SandboxTool.

import type { Control, ParamValue, ParamValues } from '../shader-catalog/types'

type Props = {
  controls: Control[]
  values: ParamValues
  onChange: (name: string, value: ParamValue) => void
  onReset: () => void
}

// ===== HELPER FUNCTIONS =====

function SliderControlRow({
  control,
  value,
  onChange,
}: {
  control: Extract<Control, { kind: 'slider' }>
  value: ParamValue
  onChange: (name: string, value: ParamValue) => void
}) {
  const inputId = `ctl-${control.name}`
  const decimalPlaces = control.step < 0.1 ? 2 : 1
  const displayValue = Number(value).toFixed(decimalPlaces)

  return (
    <div className="control" key={control.name}>
      <label htmlFor={inputId}>{control.label}</label>
      <output htmlFor={inputId} aria-live="off">
        {displayValue}
      </output>
      <input
        id={inputId}
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={Number(value)}
        data-uniform={control.name}
        onChange={(e) => onChange(control.name, Number(e.target.value))}
      />
    </div>
  )
}

function ColorControlRow({
  control,
  value,
  onChange,
}: {
  control: Extract<Control, { kind: 'color' }>
  value: ParamValue
  onChange: (name: string, value: ParamValue) => void
}) {
  const inputId = `ctl-${control.name}`
  const hexValue = String(value)

  return (
    <div className="control control-row" key={control.name}>
      <label htmlFor={inputId}>{control.label}</label>
      <output htmlFor={inputId} aria-live="off">
        {hexValue}
      </output>
      <input
        id={inputId}
        type="color"
        value={hexValue}
        data-uniform={control.name}
        onChange={(e) => onChange(control.name, e.target.value)}
      />
    </div>
  )
}

function ToggleControlRow({
  control,
  value,
  onChange,
}: {
  control: Extract<Control, { kind: 'toggle' }>
  value: ParamValue
  onChange: (name: string, value: ParamValue) => void
}) {
  const inputId = `ctl-${control.name}`

  return (
    <div className="control control-row" key={control.name}>
      <label htmlFor={inputId}>{control.label}</label>
      <input
        id={inputId}
        className="switch"
        type="checkbox"
        role="switch"
        checked={Boolean(value)}
        data-uniform={control.name}
        onChange={(e) => onChange(control.name, e.target.checked)}
      />
    </div>
  )
}

function renderOneControl(
  control: Control,
  values: ParamValues,
  onChange: (name: string, value: ParamValue) => void,
) {
  const value = values[control.name] ?? control.default

  if (control.kind === 'slider') {
    return <SliderControlRow key={control.name} control={control} value={value} onChange={onChange} />
  }
  if (control.kind === 'color') {
    return <ColorControlRow key={control.name} control={control} value={value} onChange={onChange} />
  }
  return <ToggleControlRow key={control.name} control={control} value={value} onChange={onChange} />
}

// ===== MAIN FUNCTION =====

/**
 * Render every parsed uniform as a control, plus a Reset button.
 */
export function ShaderControls({ controls, values, onChange, onReset }: Props) {
  return (
    <div className="controls">
      {controls.map((control) => renderOneControl(control, values, onChange))}
      <button type="button" className="ghost" onClick={onReset}>
        Reset to defaults
      </button>
    </div>
  )
}
