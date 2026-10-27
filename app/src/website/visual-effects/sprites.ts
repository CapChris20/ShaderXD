// Character-map pixel art definitions for marketing sprites.
// Flow: each sprite is rows of palette keys plus a color lookup table.
// Used by: PixelSprite and site sections that show logo, star, flower, arrow.

// ===== NAMED CONSTANTS =====

export const SPRITES = {
  logo: {
    rows: [
      '1...1.11110',
      '.1.1..1...1',
      '..1...1...1',
      '.1.1..1...1',
      '1...1.11110',
    ].map((row) => row.replace(/0/g, '.')),
    palette: { '1': '#f97316' },
  },
  star: {
    rows: ['...a...', '...a...', '.aaaaa.', 'aaaaaaa', '.aaaaa.', '..a.a..', '.a...a.'],
    palette: { a: '#ff6b9d' },
  },
  flower: {
    rows: ['..pp.pp..', '.pppppppp', '.pppyyppp', '..ppyypp.', '...pppp..', '....g....', '..g.g.g..', '...ggg...'],
    palette: { p: '#ff6b9d', y: '#ff6b9d', g: '#06b6d4' },
  },
  arrow: {
    rows: ['....a....', '....aa...', 'aaaaaaa..', 'aaaaaaaa.', 'aaaaaaa..', '....aa...', '....a....'],
    palette: { a: '#f5f2fa' },
  },
} as const
