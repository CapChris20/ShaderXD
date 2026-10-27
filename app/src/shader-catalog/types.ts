// Shared types for shader definitions and the controls parsed from their GLSL.
// Used by: every file under shaders/, sandbox/, and site/.

export type SliderControl = {
  kind: 'slider'
  name: string
  label: string
  min: number
  max: number
  step: number
  default: number
}

export type ColorControl = {
  kind: 'color'
  name: string
  label: string
  default: string
}

export type ToggleControl = {
  kind: 'toggle'
  name: string
  label: string
  default: boolean
}

export type Control = SliderControl | ColorControl | ToggleControl

export type ParamValue = number | string | boolean
export type ParamValues = Record<string, ParamValue>

export type BloomSettings = {
  threshold: number
  /** Base intensity. Multiplied by the value of `glowUniform` when one is given. */
  intensity: number
  glowUniform?: string
}

export type ShaderDef = {
  id: string
  name: string
  category: string
  description: string
  /** Full GLSL fragment source, including the annotated uniform declarations. */
  fragment: string
  /** Controls parsed from `fragment`. Never written by hand. */
  uniforms: Control[]
  bloom: BloomSettings
}
