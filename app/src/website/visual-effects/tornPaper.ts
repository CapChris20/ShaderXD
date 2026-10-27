// Builds a CSS clip-path polygon that looks like torn paper edges.
// Flow: seeded random → sample jagged Y offsets along top and bottom → return polygon string.
// Used by: site sections that need a hand-torn paper silhouette.

// ===== NAMED CONSTANTS =====

const RNG_MIX_A = 0x6d2b79f5
const RNG_DIVISOR = 4294967296

// ===== HELPER FUNCTIONS =====

/** Seeded pseudo-random number generator in the 0..1 range. */
function createSeededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + RNG_MIX_A) >>> 0
    let mixed = state
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / RNG_DIVISOR
  }
}

// ===== MAIN FUNCTION =====

/**
 * Deterministic torn-paper clip-path with jagged top and/or bottom edges.
 * Flow: 1. create RNG  2. walk horizontal steps  3. join into polygon()
 */
export function tornEdge(
  seed: number,
  amplitudePixels = 14,
  stepCount = 44,
  edges: { top?: boolean; bottom?: boolean } = { top: true, bottom: true },
) {
  const nextRandom = createSeededRandom(seed)
  const topPoints: string[] = []
  const bottomPoints: string[] = []

  for (let stepIndex = 0; stepIndex <= stepCount; stepIndex++) {
    const percentX = ((stepIndex / stepCount) * 100).toFixed(2)
    const topOffset = edges.top ? (nextRandom() * amplitudePixels).toFixed(1) : '0'
    const bottomOffset = edges.bottom ? (nextRandom() * amplitudePixels).toFixed(1) : '0'
    topPoints.push(`${percentX}% ${topOffset}px`)
    bottomPoints.push(`${percentX}% calc(100% - ${bottomOffset}px)`)
  }

  return `polygon(${topPoints.join(',')},${bottomPoints.reverse().join(',')})`
}
