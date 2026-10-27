// Animated isometric city of gradient columns with a drifting color wash behind them.
// Flow: paint gradient sky → wave column heights → draw lit faces → soft bloom on tops.
// Used by: How it works section and Creators page band.

import { useCallback } from 'react'
import { useCanvasLoop } from '../useCanvasLoop'
import type { DrawFn } from '../useCanvasLoop'

// ===== NAMED CONSTANTS =====

const GRID_SIZE = 14

/** Tall rainbow: deep violet → hot pink → ember → amber → mint. */
const COLOR_STOPS_RGB: [number, number, number][] = [
  [88, 28, 135],
  [255, 46, 136],
  [255, 77, 18],
  [255, 176, 46],
  [25, 255, 209],
]

const SKY_TOP = '#07040f'
const SKY_MID = '#1a0a2e'
const SKY_BOTTOM = '#0a1628'

const ISO_COS_30 = 0.866
const ISO_SIN_30 = 0.5

const LAYOUT_WIDTH_FACTOR = 1.15
const LAYOUT_HEIGHT_FACTOR = 0.55
const ORIGIN_X_FRACTION = 0.52
const ORIGIN_Y_FRACTION = 0.22

const WAVE_I_FREQUENCY = 0.48
const WAVE_J_FREQUENCY = 0.42
const WAVE_TIME_I_SPEED = 1.35
const WAVE_TIME_J_SPEED = 0.95
const SECOND_WAVE_SPEED = 0.55

const POINTER_BUMP_SIGMA = 5.5
const POINTER_BUMP_STRENGTH = 0.55
const HEIGHT_BASE = 0.08
const HEIGHT_WAVE_WEIGHT = 0.78
const COLUMN_HEIGHT_SCALE = 4.2

const FACE_LEFT_BRIGHTNESS = 0.42
const FACE_RIGHT_BRIGHTNESS = 0.68
const FACE_TOP_BRIGHTNESS = 1.15

const FLOOR_LINE_ALPHA = 0.08
const TOP_GLOW_ALPHA = 0.35
const WASH_BLOB_COUNT = 3

const CANVAS_FILL_CLASS = 'fill'

// ===== HELPER FUNCTIONS =====

/**
 * Blend across the multi-stop palette by height (0..1).
 */
function interpolateColorStop(heightKey: number): [number, number, number] {
  const lastIndex = COLOR_STOPS_RGB.length - 1
  const scaled = Math.min(0.999, Math.max(0, heightKey)) * lastIndex
  const stopIndex = Math.floor(scaled)
  const blend = scaled - stopIndex
  const fromStop = COLOR_STOPS_RGB[stopIndex]
  const toStop = COLOR_STOPS_RGB[Math.min(lastIndex, stopIndex + 1)]
  return [
    fromStop[0] + (toStop[0] - fromStop[0]) * blend,
    fromStop[1] + (toStop[1] - fromStop[1]) * blend,
    fromStop[2] + (toStop[2] - fromStop[2]) * blend,
  ]
}

function formatRgb(color: [number, number, number], brightnessScale: number, alpha = 1) {
  const red = Math.min(255, Math.round(color[0] * brightnessScale))
  const green = Math.min(255, Math.round(color[1] * brightnessScale))
  const blue = Math.min(255, Math.round(color[2] * brightnessScale))
  if (alpha >= 1) return `rgb(${red}, ${green}, ${blue})`
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function computeColumnHeightKey(
  gridI: number,
  gridJ: number,
  timeSeconds: number,
  pointerGridX: number,
  pointerGridY: number,
) {
  const primaryWave =
    0.5 +
    0.5 *
      Math.sin(gridI * WAVE_I_FREQUENCY + timeSeconds * WAVE_TIME_I_SPEED) *
      Math.cos(gridJ * WAVE_J_FREQUENCY - timeSeconds * WAVE_TIME_J_SPEED)

  const rollingWave =
    0.5 + 0.5 * Math.sin((gridI + gridJ) * 0.35 - timeSeconds * SECOND_WAVE_SPEED)

  const pointerBump =
    Math.exp(-((gridI - pointerGridX) ** 2 + (gridJ - pointerGridY) ** 2) / POINTER_BUMP_SIGMA) *
    POINTER_BUMP_STRENGTH

  const combinedWave = primaryWave * 0.7 + rollingWave * 0.3
  return Math.min(1, HEIGHT_BASE + combinedWave * HEIGHT_WAVE_WEIGHT + pointerBump)
}

/**
 * Soft drifting color blobs behind the isometric grid.
 */
function paintGradientWash(
  canvasContext: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  timeSeconds: number,
) {
  const sky = canvasContext.createLinearGradient(0, 0, 0, canvasHeight)
  sky.addColorStop(0, SKY_TOP)
  sky.addColorStop(0.45, SKY_MID)
  sky.addColorStop(1, SKY_BOTTOM)
  canvasContext.fillStyle = sky
  canvasContext.fillRect(0, 0, canvasWidth, canvasHeight)

  for (let blobIndex = 0; blobIndex < WASH_BLOB_COUNT; blobIndex++) {
    const phase = timeSeconds * (0.18 + blobIndex * 0.07) + blobIndex * 2.1
    const centerX = canvasWidth * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(phase)))
    const centerY = canvasHeight * (0.2 + 0.35 * (0.5 + 0.5 * Math.cos(phase * 0.85)))
    const radius = Math.min(canvasWidth, canvasHeight) * (0.28 + blobIndex * 0.06)
    const stop = COLOR_STOPS_RGB[blobIndex % COLOR_STOPS_RGB.length]
    const wash = canvasContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    wash.addColorStop(0, `rgba(${stop[0]}, ${stop[1]}, ${stop[2]}, 0.28)`)
    wash.addColorStop(0.55, `rgba(${stop[0]}, ${stop[1]}, ${stop[2]}, 0.08)`)
    wash.addColorStop(1, 'rgba(0, 0, 0, 0)')
    canvasContext.fillStyle = wash
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight)
  }
}

function drawIsometricColumn(
  canvasContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
  cellSize: number,
  columnHeight: number,
  heightKey: number,
) {
  const rgb = interpolateColorStop(heightKey)
  const halfWidthX = cellSize * ISO_COS_30
  const halfDepthY = cellSize * ISO_SIN_30

  // Left face (cool shadow)
  canvasContext.fillStyle = formatRgb(rgb, FACE_LEFT_BRIGHTNESS)
  canvasContext.beginPath()
  canvasContext.moveTo(anchorX - halfWidthX, anchorY - columnHeight)
  canvasContext.lineTo(anchorX, anchorY - columnHeight + halfDepthY)
  canvasContext.lineTo(anchorX, anchorY + halfDepthY)
  canvasContext.lineTo(anchorX - halfWidthX, anchorY)
  canvasContext.fill()

  // Right face
  canvasContext.fillStyle = formatRgb(rgb, FACE_RIGHT_BRIGHTNESS)
  canvasContext.beginPath()
  canvasContext.moveTo(anchorX + halfWidthX, anchorY - columnHeight)
  canvasContext.lineTo(anchorX, anchorY - columnHeight + halfDepthY)
  canvasContext.lineTo(anchorX, anchorY + halfDepthY)
  canvasContext.lineTo(anchorX + halfWidthX, anchorY)
  canvasContext.fill()

  // Top face (hot highlight)
  canvasContext.fillStyle = formatRgb(rgb, FACE_TOP_BRIGHTNESS)
  canvasContext.beginPath()
  canvasContext.moveTo(anchorX, anchorY - columnHeight - halfDepthY)
  canvasContext.lineTo(anchorX + halfWidthX, anchorY - columnHeight)
  canvasContext.lineTo(anchorX, anchorY - columnHeight + halfDepthY)
  canvasContext.lineTo(anchorX - halfWidthX, anchorY - columnHeight)
  canvasContext.fill()

  // Soft glow sitting on the tallest tops
  if (heightKey > 0.55) {
    const glowRadius = cellSize * (0.55 + heightKey * 0.45)
    const glow = canvasContext.createRadialGradient(
      anchorX,
      anchorY - columnHeight - halfDepthY * 0.2,
      0,
      anchorX,
      anchorY - columnHeight - halfDepthY * 0.2,
      glowRadius,
    )
    glow.addColorStop(0, formatRgb(rgb, 1.2, TOP_GLOW_ALPHA * heightKey))
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    canvasContext.fillStyle = glow
    canvasContext.beginPath()
    canvasContext.arc(anchorX, anchorY - columnHeight - halfDepthY * 0.2, glowRadius, 0, Math.PI * 2)
    canvasContext.fill()
  }
}

function drawFloorGuides(
  canvasContext: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  cellSize: number,
) {
  canvasContext.strokeStyle = `rgba(255, 255, 255, ${FLOOR_LINE_ALPHA})`
  canvasContext.lineWidth = 1

  for (let gridI = 0; gridI <= GRID_SIZE; gridI++) {
    const startX = originX + (gridI - 0) * cellSize * ISO_COS_30
    const startY = originY + (gridI + 0) * cellSize * ISO_SIN_30
    const endX = originX + (gridI - GRID_SIZE) * cellSize * ISO_COS_30
    const endY = originY + (gridI + GRID_SIZE) * cellSize * ISO_SIN_30
    canvasContext.beginPath()
    canvasContext.moveTo(startX, startY)
    canvasContext.lineTo(endX, endY)
    canvasContext.stroke()
  }

  for (let gridJ = 0; gridJ <= GRID_SIZE; gridJ++) {
    const startX = originX + (0 - gridJ) * cellSize * ISO_COS_30
    const startY = originY + (0 + gridJ) * cellSize * ISO_SIN_30
    const endX = originX + (GRID_SIZE - gridJ) * cellSize * ISO_COS_30
    const endY = originY + (GRID_SIZE + gridJ) * cellSize * ISO_SIN_30
    canvasContext.beginPath()
    canvasContext.moveTo(startX, startY)
    canvasContext.lineTo(endX, endY)
    canvasContext.stroke()
  }
}

function paintIsometricField(
  canvasContext: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  timeSeconds: number,
  pointer: { x: number; y: number },
) {
  // 1. Sky wash + drifting color blobs.
  paintGradientWash(canvasContext, canvasWidth, canvasHeight, timeSeconds)

  const cellSize = Math.min(
    canvasWidth / (GRID_SIZE * LAYOUT_WIDTH_FACTOR),
    canvasHeight / (GRID_SIZE * LAYOUT_HEIGHT_FACTOR),
  )
  const originX = canvasWidth * ORIGIN_X_FRACTION
  const originY = canvasHeight * ORIGIN_Y_FRACTION
  const pointerGridX = pointer.x * GRID_SIZE
  const pointerGridY = pointer.y * GRID_SIZE

  // 2. Faint floor diamond guides under the columns.
  drawFloorGuides(canvasContext, originX, originY, cellSize)

  // 3. Painter-order columns (back → front) with height waves + pointer bump.
  for (let diagonalSum = 0; diagonalSum <= 2 * GRID_SIZE - 2; diagonalSum++) {
    for (let gridI = 0; gridI < GRID_SIZE; gridI++) {
      const gridJ = diagonalSum - gridI
      if (gridJ < 0 || gridJ >= GRID_SIZE) continue

      const heightKey = computeColumnHeightKey(gridI, gridJ, timeSeconds, pointerGridX, pointerGridY)
      const columnHeight = heightKey * cellSize * COLUMN_HEIGHT_SCALE
      const anchorX = originX + (gridI - gridJ) * cellSize * ISO_COS_30
      const anchorY = originY + (gridI + gridJ) * cellSize * ISO_SIN_30

      drawIsometricColumn(canvasContext, anchorX, anchorY, cellSize, columnHeight, heightKey)
    }
  }

  // 4. Soft vignette so content stays readable on top.
  const vignette = canvasContext.createRadialGradient(
    canvasWidth * 0.5,
    canvasHeight * 0.45,
    canvasHeight * 0.15,
    canvasWidth * 0.5,
    canvasHeight * 0.5,
    canvasHeight * 0.85,
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(5, 2, 12, 0.55)')
  canvasContext.fillStyle = vignette
  canvasContext.fillRect(0, 0, canvasWidth, canvasHeight)
}

// ===== MAIN FUNCTION =====

/**
 * Isometric gradient terrain: rolling column heights, pointer bump, drifting color wash.
 */
export function IsometricBackground() {
  const draw = useCallback<DrawFn>((canvasContext, canvasWidth, canvasHeight, timeSeconds, pointer) => {
    paintIsometricField(canvasContext, canvasWidth, canvasHeight, timeSeconds, pointer)
  }, [])

  const canvasRef = useCanvasLoop(draw)
  return <canvas ref={canvasRef} className={CANVAS_FILL_CLASS} aria-hidden />
}
