// Perspective wireframe terrain with two spinning solid wireframes in the distance.
// Flow: build terrain grid → draw horizontal and vertical lines → draw cube and octahedron.
// Used by: feature sections that need retro 3D grid motion without WebGL.

import { useCallback } from 'react'
import { useCanvasLoop } from '../useCanvasLoop'
import type { DrawFn } from '../useCanvasLoop'

// ===== NAMED CONSTANTS =====

const TERRAIN_COLUMN_COUNT = 34
const TERRAIN_ROW_COUNT = 20

const CUBE_VERTICES: [number, number, number][] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
]

const CUBE_EDGES: number[][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
]

const OCTAHEDRON_VERTICES: [number, number, number][] = [
  [1.3, 0, 0],
  [-1.3, 0, 0],
  [0, 1.3, 0],
  [0, -1.3, 0],
  [0, 0, 1.3],
  [0, 0, -1.3],
]

const OCTAHEDRON_EDGES: number[][] = [
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [2, 4],
  [4, 3],
  [3, 5],
  [5, 2],
]

const PROJECTION_FOCAL_SCALE = 0.95
const PROJECTION_ASPECT = 1.8
const CAMERA_HEIGHT = 2.4
const POINTER_TILT_RANGE = 1.4
const POINTER_TILT_DEPTH = 0.3
const SCREEN_CENTER_X = 0.5
const SCREEN_BASE_Y = 0.4
const VERTICAL_STRETCH = 0.62

const TERRAIN_Z_START = 1.2
const TERRAIN_Z_STEP = 0.55
const WAVE_COLUMN_FREQUENCY = 0.45
const WAVE_ROW_FREQUENCY = 0.5
const WAVE_TIME_A = 0.9
const WAVE_TIME_B = 0.6
const WAVE_ROW_PHASE = 0.3
const WAVE_AMPLITUDE_A = 0.45
const WAVE_AMPLITUDE_B = 0.35
const WAVE_DEPTH_BLEND = 0.35
const WAVE_DEPTH_RANGE = 0.65
const HORIZONTAL_SPACING = 0.5

const HORIZONTAL_LINE_ALPHA_MIN = 0.22
const HORIZONTAL_LINE_ALPHA_RANGE = 0.7
const HORIZONTAL_LINE_COLOR = '255, 107, 157'
const GRID_LINE_WIDTH = 1

const VERTICAL_GRADIENT_TOP = 0.3
const VERTICAL_GRADIENT_ORANGE = 'rgba(249, 115, 22, 0.3)'
const VERTICAL_GRADIENT_PINK = 'rgba(255, 107, 157, 0.9)'

const CUBE_POSITION: [number, number, number] = [3.4, 1.0, 6.5]
const CUBE_SIZE = 0.9
const CUBE_SPIN = 0.6
const CUBE_COLOR = '#06b6d4'
const CUBE_BOB_AMPLITUDE = 0.15

const OCTAHEDRON_POSITION: [number, number, number] = [4.8, 2.8, 10]
const OCTAHEDRON_SIZE = 0.8
const OCTAHEDRON_SPIN = -0.5
const OCTAHEDRON_COLOR = '#f97316'
const OCTAHEDRON_BOB_AMPLITUDE = 0.2
const OCTAHEDRON_BOB_TIME_SCALE = 0.8

const SOLID_LINE_WIDTH = 1.8
const SOLID_SECONDARY_SPIN_RATIO = 0.7

const CANVAS_FILL_CLASS = 'fill'

// ===== HELPER FUNCTIONS =====

function projectWorldPoint(
  worldX: number,
  worldY: number,
  worldZ: number,
  canvasWidth: number,
  canvasHeight: number,
  focalLength: number,
  pointerTilt: number,
): [number, number] {
  const tiltedX = worldX + pointerTilt * worldZ * POINTER_TILT_DEPTH
  const screenX = canvasWidth * SCREEN_CENTER_X + (tiltedX / worldZ) * focalLength
  const screenY = canvasHeight * SCREEN_BASE_Y + ((CAMERA_HEIGHT - worldY) / worldZ) * focalLength * VERTICAL_STRETCH
  return [screenX, screenY]
}

function buildTerrainGrid(
  canvasWidth: number,
  canvasHeight: number,
  timeSeconds: number,
  focalLength: number,
  pointerTilt: number,
): [number, number][][] {
  const grid: [number, number][][] = []

  for (let rowIndex = 0; rowIndex < TERRAIN_ROW_COUNT; rowIndex++) {
    const depthZ = TERRAIN_Z_START + rowIndex * TERRAIN_Z_STEP
    const rowPoints: [number, number][] = []

    for (let columnIndex = 0; columnIndex <= TERRAIN_COLUMN_COUNT; columnIndex++) {
      const waveY =
        (Math.sin(columnIndex * WAVE_COLUMN_FREQUENCY + timeSeconds * WAVE_TIME_A + rowIndex * WAVE_ROW_PHASE) *
          WAVE_AMPLITUDE_A +
          Math.sin(rowIndex * WAVE_ROW_FREQUENCY - timeSeconds * WAVE_TIME_B) * WAVE_AMPLITUDE_B) *
        (WAVE_DEPTH_BLEND + (WAVE_DEPTH_RANGE * rowIndex) / TERRAIN_ROW_COUNT)

      const worldX = (columnIndex - TERRAIN_COLUMN_COUNT / 2) * HORIZONTAL_SPACING
      rowPoints.push(projectWorldPoint(worldX, waveY, depthZ, canvasWidth, canvasHeight, focalLength, pointerTilt))
    }

    grid.push(rowPoints)
  }

  return grid
}

function strokePolyline(canvasContext: CanvasRenderingContext2D, points: [number, number][]) {
  canvasContext.beginPath()
  for (let index = 0; index < points.length; index++) {
    const point = points[index]
    if (index === 0) canvasContext.moveTo(point[0], point[1])
    else canvasContext.lineTo(point[0], point[1])
  }
  canvasContext.stroke()
}

function drawTerrainHorizontalLines(canvasContext: CanvasRenderingContext2D, grid: [number, number][][]) {
  canvasContext.lineWidth = GRID_LINE_WIDTH

  for (let rowIndex = 0; rowIndex < TERRAIN_ROW_COUNT; rowIndex++) {
    const depthFade = 1 - rowIndex / TERRAIN_ROW_COUNT
    const alpha = HORIZONTAL_LINE_ALPHA_MIN + depthFade * HORIZONTAL_LINE_ALPHA_RANGE
    canvasContext.strokeStyle = `rgba(${HORIZONTAL_LINE_COLOR}, ${alpha})`
    strokePolyline(canvasContext, grid[rowIndex])
  }
}

function drawTerrainVerticalLines(
  canvasContext: CanvasRenderingContext2D,
  _canvasWidth: number,
  canvasHeight: number,
  grid: [number, number][][],
) {
  const verticalGradient = canvasContext.createLinearGradient(0, canvasHeight * VERTICAL_GRADIENT_TOP, 0, canvasHeight)
  verticalGradient.addColorStop(0, VERTICAL_GRADIENT_ORANGE)
  verticalGradient.addColorStop(1, VERTICAL_GRADIENT_PINK)
  canvasContext.strokeStyle = verticalGradient

  for (let columnIndex = 0; columnIndex <= TERRAIN_COLUMN_COUNT; columnIndex++) {
    const columnPoints: [number, number][] = []
    for (let rowIndex = 0; rowIndex < TERRAIN_ROW_COUNT; rowIndex++) {
      columnPoints.push(grid[rowIndex][columnIndex])
    }
    strokePolyline(canvasContext, columnPoints)
  }
}

function drawWireframeSolid(
  canvasContext: CanvasRenderingContext2D,
  vertices: [number, number, number][],
  edges: number[][],
  worldPosition: [number, number, number],
  size: number,
  spinSpeed: number,
  strokeColor: string,
  timeSeconds: number,
  canvasWidth: number,
  canvasHeight: number,
  focalLength: number,
  pointerTilt: number,
) {
  const spinA = timeSeconds * spinSpeed
  const spinB = timeSeconds * spinSpeed * SOLID_SECONDARY_SPIN_RATIO

  const projectedPoints: [number, number][] = []
  for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex++) {
    const localX = vertices[vertexIndex][0]
    const localY = vertices[vertexIndex][1]
    const localZ = vertices[vertexIndex][2]

    const rotatedX = localX * Math.cos(spinA) - localZ * Math.sin(spinA)
    const rotatedZ = localX * Math.sin(spinA) + localZ * Math.cos(spinA)
    const rotatedY = localY * Math.cos(spinB) - rotatedZ * Math.sin(spinB)
    const finalZ = localY * Math.sin(spinB) + rotatedZ * Math.cos(spinB)

    projectedPoints.push(
      projectWorldPoint(
        worldPosition[0] + rotatedX * size,
        worldPosition[1] + rotatedY * size,
        worldPosition[2] + finalZ * size,
        canvasWidth,
        canvasHeight,
        focalLength,
        pointerTilt,
      ),
    )
  }

  canvasContext.strokeStyle = strokeColor
  canvasContext.lineWidth = SOLID_LINE_WIDTH
  canvasContext.beginPath()
  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    const fromIndex = edges[edgeIndex][0]
    const toIndex = edges[edgeIndex][1]
    canvasContext.moveTo(projectedPoints[fromIndex][0], projectedPoints[fromIndex][1])
    canvasContext.lineTo(projectedPoints[toIndex][0], projectedPoints[toIndex][1])
  }
  canvasContext.stroke()
}

function paintWireframeScene(
  canvasContext: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  timeSeconds: number,
  pointer: { x: number; y: number },
) {
  canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)

  const focalLength = Math.min(canvasWidth, canvasHeight * PROJECTION_ASPECT) * PROJECTION_FOCAL_SCALE
  const pointerTilt = (pointer.x - 0.5) * POINTER_TILT_RANGE
  const terrainGrid = buildTerrainGrid(canvasWidth, canvasHeight, timeSeconds, focalLength, pointerTilt)

  drawTerrainHorizontalLines(canvasContext, terrainGrid)
  drawTerrainVerticalLines(canvasContext, canvasWidth, canvasHeight, terrainGrid)

  const cubeY = CUBE_POSITION[1] + Math.sin(timeSeconds) * CUBE_BOB_AMPLITUDE
  const cubePosition: [number, number, number] = [CUBE_POSITION[0], cubeY, CUBE_POSITION[2]]

  drawWireframeSolid(
    canvasContext,
    CUBE_VERTICES,
    CUBE_EDGES,
    cubePosition,
    CUBE_SIZE,
    CUBE_SPIN,
    CUBE_COLOR,
    timeSeconds,
    canvasWidth,
    canvasHeight,
    focalLength,
    pointerTilt,
  )

  const octaY = OCTAHEDRON_POSITION[1] + Math.cos(timeSeconds * OCTAHEDRON_BOB_TIME_SCALE) * OCTAHEDRON_BOB_AMPLITUDE
  const octaPosition: [number, number, number] = [OCTAHEDRON_POSITION[0], octaY, OCTAHEDRON_POSITION[2]]

  drawWireframeSolid(
    canvasContext,
    OCTAHEDRON_VERTICES,
    OCTAHEDRON_EDGES,
    octaPosition,
    OCTAHEDRON_SIZE,
    OCTAHEDRON_SPIN,
    OCTAHEDRON_COLOR,
    timeSeconds,
    canvasWidth,
    canvasHeight,
    focalLength,
    pointerTilt,
  )
}

// ===== MAIN FUNCTION =====

/** Wireframe 3D: a perspective polygon terrain with two spinning wireframe solids. Canvas 2D, no shader. */
export function WireframeBackground() {
  const draw = useCallback<DrawFn>((canvasContext, canvasWidth, canvasHeight, timeSeconds, pointer) => {
    paintWireframeScene(canvasContext, canvasWidth, canvasHeight, timeSeconds, pointer)
  }, [])

  const canvasRef = useCanvasLoop(draw)
  return <canvas ref={canvasRef} className={CANVAS_FILL_CLASS} aria-hidden />
}
