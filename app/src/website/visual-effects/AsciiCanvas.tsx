// ASCII-art canvas: perspective grid, sliced sun, and twinkling stars.
// Flow: resize canvas → sample brightness per cell → pick ramp character and ink color.
// Used by: hero and demo sections that want a retro terminal skyline.

import { useEffect, useRef } from 'react'

// ===== NAMED CONSTANTS =====

const ASCII_BRIGHTNESS_RAMP = ' .:-=+*#%@'

const HASH_X_SCALE = 127.1
const HASH_Y_SCALE = 311.7
const HASH_SINE_SCALE = 43758.5453

const SKY_HORIZON_NORMALIZED = 0.12
const SUN_CENTER_Y_OFFSET = 0.06
const SUN_RADIUS = 0.26
const SUN_BAR_FREQUENCY = 14
const SUN_BAR_TIME_SPEED = 0.6
const SUN_GAP_SKY_FACTOR = 3
const SUN_GAP_STRENGTH = 0.8
const SUN_BRIGHTNESS_BASE = 0.55
const SUN_BRIGHTNESS_RANGE = 0.45
const SUN_HEIGHT_DIVISOR = 0.52

const STAR_GRID_X = 90
const STAR_GRID_Y = 40
const STAR_DENSITY_THRESHOLD = 0.985
const STAR_TWINKLE_SPEED = 3
const STAR_TWINKLE_PHASE_SCALE = 50
const STAR_SKY_GLOW = 0.18
const STAR_DISTANCE_FADE = 0.25

const GROUND_DEPTH_EPSILON = 0.02
const GRID_X_SCALE = 1.4
const GRID_LINE_X_HALF_WIDTH = 0.04
const GRID_LINE_Z_HALF_WIDTH = 0.05
const GRID_Z_TIME_SPEED = 0.7
const GRID_Z_SCALE = 0.5
const GRID_FADE_NUMERATOR = 1.2
const GRID_FADE_OFFSET = 0.15
const GRID_LINE_STRENGTH = 0.9

const MOUSE_SUN_INFLUENCE = 0.1

const CELL_WIDTH_PX = 11
const CELL_HEIGHT_PX = 18
const FONT_SIZE_OFFSET_PX = 3
const MAX_DEVICE_PIXEL_RATIO = 2
const FRAME_INTERVAL_MS = 42
const MIN_BRIGHTNESS_TO_DRAW = 0.06

const INK_HIGH_THRESHOLD = 0.8
const INK_MID_THRESHOLD = 0.45
const INK_COLOR_HIGH = '#ffc2d6'
const INK_COLOR_MID = '#f97316'
const INK_COLOR_LOW = '#be185d'

const MONO_FONT_FAMILY = '"JetBrains Mono", monospace'

// ===== HELPER FUNCTIONS =====

function hashNoiseAtGrid(cellX: number, cellY: number) {
  const sineValue = Math.sin(cellX * HASH_X_SCALE + cellY * HASH_Y_SCALE) * HASH_SINE_SCALE
  return sineValue - Math.floor(sineValue)
}

/** Brightness 0..1 for a cell: a sliced sun over a perspective grid, with stars above. */
function sampleCellBrightness(
  normalizedX: number,
  normalizedY: number,
  aspectRatio: number,
  timeSeconds: number,
  mouseNormalized: number,
) {
  const offsetX = (normalizedX - 0.5) * aspectRatio
  const offsetY = normalizedY - 0.5

  if (offsetY < SKY_HORIZON_NORMALIZED) {
    const sunLocalY = offsetY + SUN_CENTER_Y_OFFSET
    const distanceToSun = Math.hypot(offsetX - mouseNormalized * MOUSE_SUN_INFLUENCE, sunLocalY)

    if (distanceToSun < SUN_RADIUS) {
      const barPhase = (sunLocalY * SUN_BAR_FREQUENCY - timeSeconds * SUN_BAR_TIME_SPEED) % 1
      const gapLimit = Math.max(0, Math.min(1, -sunLocalY * SUN_GAP_SKY_FACTOR)) * SUN_GAP_STRENGTH
      if (sunLocalY > 0 && Math.abs(barPhase) < gapLimit) return 0
      return SUN_BRIGHTNESS_BASE + SUN_BRIGHTNESS_RANGE * (0.5 - sunLocalY / SUN_HEIGHT_DIVISOR)
    }

    const starSeed = hashNoiseAtGrid(Math.floor(normalizedX * STAR_GRID_X), Math.floor(normalizedY * STAR_GRID_Y))
    if (starSeed > STAR_DENSITY_THRESHOLD) {
      return 0.5 + 0.5 * Math.sin(timeSeconds * STAR_TWINKLE_SPEED + starSeed * STAR_TWINKLE_PHASE_SCALE)
    }
    return Math.max(0, STAR_SKY_GLOW - distanceToSun * STAR_DISTANCE_FADE)
  }

  const depth = 1 / (offsetY - SKY_HORIZON_NORMALIZED + GROUND_DEPTH_EPSILON)
  const gridX = Math.abs(((offsetX * depth * GRID_X_SCALE) % 1) - 0.5)
  const gridZ = Math.abs(((depth * GRID_Z_SCALE + timeSeconds * GRID_Z_TIME_SPEED) % 1) - 0.5)
  const isGridLine = Math.max(gridX < GRID_LINE_X_HALF_WIDTH ? 1 : 0, gridZ < GRID_LINE_Z_HALF_WIDTH ? 1 : 0)
  return isGridLine * Math.min(1, GRID_FADE_NUMERATOR / depth + GRID_FADE_OFFSET) * GRID_LINE_STRENGTH
}

function pickInkColor(brightness: number) {
  if (brightness > INK_HIGH_THRESHOLD) return INK_COLOR_HIGH
  if (brightness > INK_MID_THRESHOLD) return INK_COLOR_MID
  return INK_COLOR_LOW
}

function pickRampCharacter(brightness: number) {
  const rampIndex = Math.min(ASCII_BRIGHTNESS_RAMP.length - 1, Math.floor(brightness * ASCII_BRIGHTNESS_RAMP.length))
  return ASCII_BRIGHTNESS_RAMP[rampIndex]
}

// ===== MAIN FUNCTION =====

export function AsciiCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current
    const canvasContext = canvasElement?.getContext('2d')
    if (!canvasElement || !canvasContext) return

    let animationFrameId = 0
    let lastFrameTimestamp = 0
    let mouseNormalized = 0

    const handleResize = () => {
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
      const bounds = canvasElement.getBoundingClientRect()
      canvasElement.width = Math.max(1, bounds.width * devicePixelRatio)
      canvasElement.height = Math.max(1, bounds.height * devicePixelRatio)
      canvasContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvasElement.getBoundingClientRect()
      mouseNormalized = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    }

    const drawFrame = (timestampMs: number) => {
      animationFrameId = requestAnimationFrame(drawFrame)
      if (timestampMs - lastFrameTimestamp < FRAME_INTERVAL_MS) return
      lastFrameTimestamp = timestampMs

      const bounds = canvasElement.getBoundingClientRect()
      const columnCount = Math.floor(bounds.width / CELL_WIDTH_PX)
      const rowCount = Math.floor(bounds.height / CELL_HEIGHT_PX)
      const timeSeconds = timestampMs / 1000
      const aspectRatio = (columnCount * CELL_WIDTH_PX) / (rowCount * CELL_HEIGHT_PX)

      canvasContext.clearRect(0, 0, bounds.width, bounds.height)
      canvasContext.font = `${CELL_HEIGHT_PX - FONT_SIZE_OFFSET_PX}px ${MONO_FONT_FAMILY}`
      canvasContext.textBaseline = 'top'

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
          const brightness = sampleCellBrightness(
            columnIndex / columnCount,
            rowIndex / rowCount,
            aspectRatio,
            timeSeconds,
            mouseNormalized,
          )
          if (brightness < MIN_BRIGHTNESS_TO_DRAW) continue
          canvasContext.fillStyle = pickInkColor(brightness)
          canvasContext.fillText(
            pickRampCharacter(brightness),
            columnIndex * CELL_WIDTH_PX,
            rowIndex * CELL_HEIGHT_PX,
          )
        }
      }
    }

    handleResize()
    animationFrameId = requestAnimationFrame(drawFrame)
    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointerMove)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
