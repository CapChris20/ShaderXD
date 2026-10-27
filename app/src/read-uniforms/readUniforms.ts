// Read annotated `uniform` lines from GLSL and turn them into UI controls.
// Flow: strip block comments → scan each line → build slider / color / toggle → return list.
// Used by: shaders/common.ts (defineShader) and export tests.

import type { Control } from '../shader-catalog/types'

// ===== NAMED CONSTANTS =====

/** Uniforms the runtime fills in itself. They never become controls. */
export const BUILTIN_UNIFORMS = ['u_time', 'u_resolution', 'u_look', 'u_travel'] as const

const DEFAULT_SLIDER_MIN = 0
const DEFAULT_SLIDER_MAX = 1
const DEFAULT_SLIDER_STEP = 0.01
const FALLBACK_COLOR_HEX = '#ffffff'
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const UNIFORM_LINE_PATTERN =
  /^\s*uniform\s+(?:(?:lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*;\s*(?:\/\/(.*))?$/
const BLOCK_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g
const ANNOTATION_TOKEN_PATTERN = /(\w+)=(?:"([^"]*)"|(\S+))|(\w+)/g
const COLOR_NAME_PATTERN = /colou?r/i

// ===== HELPER FUNCTIONS =====

/**
 * Pull key=value pairs and bare flags out of a trailing `//` annotation.
 * @param {string} comment
 */
function parseAnnotation(comment: string) {
  const attrs: Record<string, string> = {}
  const flags = new Set<string>()

  for (const token of comment.matchAll(ANNOTATION_TOKEN_PATTERN)) {
    const attrName = token[1]
    const quotedValue = token[2]
    const bareValue = token[3]
    const flagName = token[4]

    if (attrName) {
      attrs[attrName] = quotedValue ?? bareValue
    } else if (flagName) {
      flags.add(flagName)
    }
  }

  return { attrs, flags }
}

/**
 * Parse a number from an annotation, or use the fallback when missing/invalid.
 */
function numberFromAnnotation(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

/**
 * Turn `u_glow_amount` into `Glow amount` for a default label.
 */
function humanizeUniformName(uniformName: string): string {
  const withoutPrefix = uniformName.replace(/^u_/, '')
  const words = withoutPrefix.split('_').join(' ')
  const firstLetter = words.charAt(0).toUpperCase()
  const rest = words.slice(1)
  return firstLetter + rest
}

/**
 * Decide which control kind a uniform should become, or skip it.
 */
function buildControlFromUniform(
  type: string,
  name: string,
  comment: string,
): Control | null {
  const { attrs, flags } = parseAnnotation(comment)
  const label = attrs.label ?? humanizeUniformName(name)

  if (type === 'float') {
    const min = numberFromAnnotation(attrs.min, DEFAULT_SLIDER_MIN)
    const max = numberFromAnnotation(attrs.max, DEFAULT_SLIDER_MAX)
    const step = numberFromAnnotation(attrs.step, DEFAULT_SLIDER_STEP)
    const defaultValue = numberFromAnnotation(attrs.default, min)
    return { kind: 'slider', name, label, min, max, step, default: defaultValue }
  }

  const isColorVec3 =
    type === 'vec3' && (flags.has('color') || COLOR_NAME_PATTERN.test(name))
  if (isColorVec3) {
    const hasValidHex = attrs.default && HEX_COLOR_PATTERN.test(attrs.default)
    const value = hasValidHex ? attrs.default!.toLowerCase() : FALLBACK_COLOR_HEX
    return { kind: 'color', name, label, default: value }
  }

  if (type === 'bool') {
    const defaultValue = attrs.default === 'true'
    return { kind: 'toggle', name, label, default: defaultValue }
  }

  return null
}

// ===== MAIN FUNCTION =====

/**
 * Reads `uniform` declarations from GLSL and returns the controls they describe.
 *
 *   uniform float u_speed;  // min=0 max=6 step=0.05 default=1.4 label="Speed"
 *   uniform vec3  u_color;  // color default=#ff2e88
 *   uniform bool  u_stripes; // default=true
 *
 * float -> slider, vec3 whose name contains "color" (or flagged `color`) -> color picker, bool -> toggle.
 * Anything else is skipped.
 *
 * @param {string} source
 * @returns {Control[]}
 */
export function readUniforms(source: string): Control[] {
  // 1. Strip block comments so commented-out uniforms do not become controls.
  const withoutBlockComments = source.replace(BLOCK_COMMENT_PATTERN, '')
  const lines = withoutBlockComments.split('\n')

  // 2. Walk each line once; skip built-ins and duplicates.
  const controls: Control[] = []
  const seenNames = new Set<string>(BUILTIN_UNIFORMS)

  for (const line of lines) {
    const match = UNIFORM_LINE_PATTERN.exec(line)
    if (!match) continue

    const type = match[1]
    const name = match[2]
    const comment = match[3] ?? ''

    if (seenNames.has(name)) continue

    // 3. Turn this uniform into a control, or skip unsupported types.
    const control = buildControlFromUniform(type, name, comment)
    if (!control) continue

    controls.push(control)
    seenNames.add(name)
  }

  // 4. Return controls in declaration order.
  return controls
}

/**
 * Convert '#ff2e88' to RGB channels in 0..1 for the GPU.
 * Colors are passed to shaders as display-referred values.
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export function hexToRgb(hex: string): [number, number, number] {
  const asNumber = parseInt(hex.slice(1), 16)
  const red = ((asNumber >> 16) & 255) / 255
  const green = ((asNumber >> 8) & 255) / 255
  const blue = (asNumber & 255) / 255
  return [red, green, blue]
}
