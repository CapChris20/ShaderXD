// Renders a character-map sprite on a 1px-per-cell canvas and scales with nearest-neighbour CSS.
// Flow: paint palette cells → expose canvas with aria label and pixel class.
// Used by: marketing sections that show logo, star, flower, and arrow sprites.

import { useEffect, useRef } from 'react'

// ===== NAMED CONSTANTS =====

const PIXEL_SPRITE_CLASS = 'pixel'

type PixelSpriteProps = {
  rows: readonly string[]
  palette: Readonly<Record<string, string>>
  scale?: number
  label: string
  className?: string
}

// ===== HELPER FUNCTIONS =====

function paintSpritePixels(
  canvasContext: CanvasRenderingContext2D,
  rows: readonly string[],
  palette: Readonly<Record<string, string>>,
  pixelWidth: number,
  pixelHeight: number,
) {
  canvasContext.clearRect(0, 0, pixelWidth, pixelHeight)

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowText = rows[rowIndex]
    for (let columnIndex = 0; columnIndex < rowText.length; columnIndex++) {
      const paletteKey = rowText[columnIndex]
      const fillColor = palette[paletteKey]
      if (!fillColor) continue
      canvasContext.fillStyle = fillColor
      canvasContext.fillRect(columnIndex, rowIndex, 1, 1)
    }
  }
}

// ===== MAIN FUNCTION =====

/** Draws a character-map sprite 1px per cell on a canvas and scales it with nearest-neighbour. */
export function PixelSprite({
  rows,
  palette,
  scale = 4,
  label,
  className = '',
}: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelWidth = rows[0].length
  const pixelHeight = rows.length

  useEffect(() => {
    const canvasContext = canvasRef.current?.getContext('2d')
    if (!canvasContext) return
    paintSpritePixels(canvasContext, rows, palette, pixelWidth, pixelHeight)
  }, [rows, palette, pixelWidth, pixelHeight])

  const displayWidth = pixelWidth * scale
  const displayHeight = pixelHeight * scale
  const combinedClassName = `${PIXEL_SPRITE_CLASS} ${className}`.trim()

  return (
    <canvas
      ref={canvasRef}
      width={pixelWidth}
      height={pixelHeight}
      role="img"
      aria-label={label}
      className={combinedClassName}
      style={{ width: displayWidth, height: displayHeight }}
    />
  )
}
