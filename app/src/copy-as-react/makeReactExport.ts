// Build the Usage snippet and the self-contained ShaderXD.tsx file for the export modal.
// Flow: literalize live values → fill the template marker → return usage + component text.
// Used by: CopyAsReactModal.

import template from './shaderViewTemplate.tsx?raw'
import type { ParamValue, ParamValues, ShaderDef } from '../shader-catalog/types'

export type ReactExport = {
  /** Import plus the JSX that renders the shader with the current values. */
  usage: string
  /** The self-contained ShaderXD.tsx the usage snippet imports from. */
  component: string
}

// ===== HELPER FUNCTIONS =====

/**
 * Turn a control value into source text for the usage / defaults blocks.
 */
function valueAsSourceLiteral(value: ParamValue): string {
  if (typeof value === 'string') return `'${value}'`
  return String(value)
}

/**
 * Escape GLSL so it is safe inside a JavaScript template literal.
 */
function glslAsTemplateLiteral(glsl: string): string {
  const escaped = glsl
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
  return '`' + escaped + '`'
}

/**
 * One shader entry block that gets spliced into the template's SHADERS map.
 */
function buildShaderRegistryEntry(shader: ShaderDef): string {
  const defaultLines = shader.uniforms.map(
    (control) => `      ${control.name}: ${valueAsSourceLiteral(control.default)},`,
  )
  const bloom = shader.bloom
  const glowPart = bloom.glowUniform ? `, glowUniform: '${bloom.glowUniform}'` : ''

  return [
    `  '${shader.id}': {`,
    `    fragment: ${glslAsTemplateLiteral(shader.fragment)},`,
    `    defaults: {`,
    ...defaultLines,
    `    },`,
    `    bloom: { threshold: ${bloom.threshold}, intensity: ${bloom.intensity}${glowPart} },`,
    `  },`,
  ].join('\n')
}

// ===== MAIN FUNCTION =====

/**
 * Build the React export for the current shader and live control values.
 * Flow: 1. usage snippet  2. registry entry  3. splice into template  4. return both
 *
 * @param {ShaderDef} shader
 * @param {ParamValues} values
 * @returns {ReactExport}
 */
export function makeReactExport(shader: ShaderDef, values: ParamValues): ReactExport {
  // 1. Build the short usage snippet with the live values.
  const paramLines = shader.uniforms.map((control) => {
    const liveValue = values[control.name] ?? control.default
    return `${control.name}: ${valueAsSourceLiteral(liveValue)}`
  })

  const usage = [
    `import { ShaderXD } from './ShaderXD'`,
    '',
    `<ShaderXD`,
    `  shader="${shader.id}"`,
    `  params={{`,
    ...paramLines.map((line) => `    ${line},`),
    `  }}`,
    `/>`,
  ].join('\n')

  // 2. Build the registry entry for this one shader.
  const registryEntry = buildShaderRegistryEntry(shader)

  // 3. Drop it into the shared template at the marker.
  const component = template.replace('  // __SHADERS__', registryEntry)

  // 4. Hand both pieces to the modal.
  return { usage, component }
}
