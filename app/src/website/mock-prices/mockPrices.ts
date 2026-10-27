// Mock marketplace prices and creator revenue share for prototype pages.
// Flow: look up price by shader id → format label → apply creator share in forms.
// Used by: BrowseShaders filters, SellShaders earnings copy, and price badges.

// ===== NAMED CONSTANTS =====

/** Prototype marketplace data: prices are mock-ups, nothing is sold. */
export const PRICES: Record<string, number> = {
  'glowing-orb': 0,
  'neon-grid-horizon': 4.99,
  'liquid-morph': 0,
  'holographic-foil': 4.99,
  'fractal-bulb': 9.99,
  'particle-swarm': 1.99,
  metaballs: 0,
  'glitch-block': 1.99,
  'topographic-lines': 0,
  'halftone-dots': 4.99,
  'dither-wave': 0,
  'liquid-chrome': 9.99,
  'ascii-liquid-chrome': 4.99,
  'ember-smoke': 4.99,
  'optic-tunnel': 1.99,
}

export const CREATOR_SHARE = 0.7

// ===== HELPER FUNCTIONS =====

/** Human-readable price for a shader id (`Free` or `$x.xx`). */
export function priceLabel(shaderId: string) {
  const dollars = PRICES[shaderId] ?? 0
  return dollars === 0 ? 'Free' : `$${dollars.toFixed(2)}`
}
