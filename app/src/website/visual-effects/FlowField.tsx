// Noise-driven particle flow field with pointer repulsion and fading ink trails.
// Flow: spawn particles → step along noise angle → draw segment → respawn when dead or off-screen.
// Used by: interactive hero panels that need organic motion without WebGL.

import { useEffect, useRef } from 'react'

// ===== NAMED CONSTANTS =====

const INK_COLORS = ['#f97316', '#ff6b9d', '#f5f2fa', '#ff6b9d'] as const

const HASH_X_SCALE = 127.1
const HASH_Y_SCALE = 311.7
const HASH_SINE_SCALE = 43758.5453

const BACKGROUND_FILL = '#0a0a0f'
const TRAIL_FADE_COLOR = 'rgba(10,10,15,0.07)'

const MAX_DEVICE_PIXEL_RATIO = 2
const PARTICLE_AREA_DIVISOR = 1800
const MAX_PARTICLE_COUNT = 1100

const NOISE_SAMPLE_SCALE = 0.004
const TIME_SCALE = 0.00008
const ANGLE_TURNS = 4
const STROKE_WIDTH = 1.2
const STROKE_ALPHA = 0.55
const STEP_DISTANCE = 1.7

const POINTER_REPULSION_RADIUS_SQUARED = 14000

const LIFE_MIN_FRAMES = 80
const LIFE_RANDOM_RANGE = 220

const POINTER_OFFSCREEN = -1e4

// ===== TYPES =====

type FlowParticle = {
  x: number
  y: number
  inkColor: string
  framesRemaining: number
}

// ===== HELPER FUNCTIONS =====

function hashNoiseAtGrid(cellX: number, cellY: number) {
  const sineValue = Math.sin(cellX * HASH_X_SCALE + cellY * HASH_Y_SCALE) * HASH_SINE_SCALE
  return sineValue - Math.floor(sineValue)
}

function smoothNoise(sampleX: number, sampleY: number) {
  const gridX = Math.floor(sampleX)
  const gridY = Math.floor(sampleY)
  const blendX = (sampleX - gridX) ** 2 * (3 - 2 * (sampleX - gridX))
  const blendY = (sampleY - gridY) ** 2 * (3 - 2 * (sampleY - gridY))

  const topLeft = hashNoiseAtGrid(gridX, gridY)
  const topRight = hashNoiseAtGrid(gridX + 1, gridY)
  const bottomLeft = hashNoiseAtGrid(gridX, gridY + 1)
  const bottomRight = hashNoiseAtGrid(gridX + 1, gridY + 1)

  const topEdge = topLeft + (topRight - topLeft) * blendX
  const bottomEdge = bottomLeft + (bottomRight - bottomLeft) * blendX
  return topEdge + (bottomEdge - topEdge) * blendY
}

function createRandomParticle(canvasWidth: number, canvasHeight: number): FlowParticle {
  const inkIndex = Math.floor(Math.random() * INK_COLORS.length)
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    inkColor: INK_COLORS[inkIndex],
    framesRemaining: LIFE_MIN_FRAMES + Math.random() * LIFE_RANDOM_RANGE,
  }
}

function countParticlesForArea(canvasWidth: number, canvasHeight: number) {
  const rawCount = Math.floor((canvasWidth * canvasHeight) / PARTICLE_AREA_DIVISOR)
  return Math.min(MAX_PARTICLE_COUNT, rawCount)
}

function shouldRespawnParticle(particle: FlowParticle, canvasWidth: number, canvasHeight: number) {
  if (particle.framesRemaining < 0) return true
  if (particle.x < 0 || particle.x > canvasWidth) return true
  if (particle.y < 0 || particle.y > canvasHeight) return true
  return false
}

function stepParticle(
  particle: FlowParticle,
  canvasContext: CanvasRenderingContext2D,
  timeOffset: number,
  pointerX: number,
  pointerY: number,
) {
  let travelAngle = smoothNoise(particle.x * NOISE_SAMPLE_SCALE + timeOffset, particle.y * NOISE_SAMPLE_SCALE) * Math.PI * ANGLE_TURNS

  const deltaX = particle.x - pointerX
  const deltaY = particle.y - pointerY
  const distanceSquared = deltaX * deltaX + deltaY * deltaY
  if (distanceSquared < POINTER_REPULSION_RADIUS_SQUARED) {
    travelAngle = Math.atan2(deltaY, deltaX)
  }

  const nextX = particle.x + Math.cos(travelAngle) * STEP_DISTANCE
  const nextY = particle.y + Math.sin(travelAngle) * STEP_DISTANCE

  canvasContext.strokeStyle = particle.inkColor
  canvasContext.globalAlpha = STROKE_ALPHA
  canvasContext.beginPath()
  canvasContext.moveTo(particle.x, particle.y)
  canvasContext.lineTo(nextX, nextY)
  canvasContext.stroke()

  particle.x = nextX
  particle.y = nextY
  particle.framesRemaining -= 1
}

// ===== MAIN FUNCTION =====

/** Particles ride a noise-driven angle field and leave fading ink trails. The pointer shoves them aside. */
export function FlowField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current
    const canvasContext = canvasElement?.getContext('2d')
    if (!canvasElement || !canvasContext) return

    let canvasWidth = 1
    let canvasHeight = 1
    let animationFrameId = 0
    const pointer = { x: POINTER_OFFSCREEN, y: POINTER_OFFSCREEN }
    const particles: FlowParticle[] = []

    const refillParticles = () => {
      particles.length = 0
      const targetCount = countParticlesForArea(canvasWidth, canvasHeight)
      for (let index = 0; index < targetCount; index++) {
        particles.push(createRandomParticle(canvasWidth, canvasHeight))
      }
    }

    const handleResize = () => {
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
      const bounds = canvasElement.getBoundingClientRect()
      canvasWidth = bounds.width
      canvasHeight = bounds.height
      canvasElement.width = canvasWidth * devicePixelRatio
      canvasElement.height = canvasHeight * devicePixelRatio
      canvasContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      canvasContext.fillStyle = BACKGROUND_FILL
      canvasContext.fillRect(0, 0, canvasWidth, canvasHeight)
      refillParticles()
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvasElement.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
    }

    const runFrame = (timestampMs: number) => {
      animationFrameId = requestAnimationFrame(runFrame)

      canvasContext.fillStyle = TRAIL_FADE_COLOR
      canvasContext.fillRect(0, 0, canvasWidth, canvasHeight)

      const timeOffset = timestampMs * TIME_SCALE
      canvasContext.lineWidth = STROKE_WIDTH

      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index]
        stepParticle(particle, canvasContext, timeOffset, pointer.x, pointer.y)
        if (shouldRespawnParticle(particle, canvasWidth, canvasHeight)) {
          Object.assign(particle, createRandomParticle(canvasWidth, canvasHeight))
        }
      }

      canvasContext.globalAlpha = 1
    }

    handleResize()
    animationFrameId = requestAnimationFrame(runFrame)
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
