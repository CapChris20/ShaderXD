// Catalog of every shippable shader, plus lookup helpers.
// Flow: list → find by id → defaults for controls.
// Used by: website, live-sandbox, full-window preview, export tests.

import asciiLiquidChrome from './ascii-liquid-chrome'
import ditherWave from './dither-wave'
import emberSmoke from './ember-smoke'
import fractalBulb from './fractal-bulb'
import glitchBlock from './glitch-block'
import glowingOrb from './glowing-orb'
import halftoneDots from './halftone-dots'
import holographicFoil from './holographic-foil'
import liquidChrome from './liquid-chrome'
import liquidMorph from './liquid-morph'
import metaballs from './metaballs'
import neonGridHorizon from './neon-grid-horizon'
import opticTunnel from './optic-tunnel'
import particleSwarm from './particle-swarm'
import topographicLines from './topographic-lines'
import type { ParamValues, ShaderDef } from './types'

// ===== NAMED CONSTANTS =====

/** Gallery order: hero-friendly shaders first, then the rest of the library. */
export const shaders: ShaderDef[] = [
  glowingOrb,
  neonGridHorizon,
  liquidMorph,
  holographicFoil,
  fractalBulb,
  particleSwarm,
  metaballs,
  glitchBlock,
  topographicLines,
  halftoneDots,
  ditherWave,
  liquidChrome,
  asciiLiquidChrome,
  emberSmoke,
  opticTunnel,
]

// ===== MAIN FUNCTIONS =====

/**
 * Find a shader by id. Unknown ids fall back to the first shader in the list.
 * @param {string} id
 * @returns {ShaderDef}
 */
export function getShader(id: string): ShaderDef {
  // 1. Look for an exact id match.
  const match = shaders.find((shader) => shader.id === id)
  if (match) return match

  // 2. Unknown id → first shader so the UI never crashes.
  return shaders[0]
}

/**
 * Build the default param map for a shader's controls.
 * @param {ShaderDef} shader
 * @returns {ParamValues}
 */
export function defaultsOf(shader: ShaderDef): ParamValues {
  const values: ParamValues = {}
  for (const control of shader.uniforms) {
    values[control.name] = control.default
  }
  return values
}
