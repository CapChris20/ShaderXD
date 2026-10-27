// Sizes a canvas to its container, tracks pointer position, and runs a draw callback each frame.
// Flow: resize with DPR → pointer normalized 0..1 → requestAnimationFrame loop (or one frame if reduced motion).
// Used by: IsometricBackground, WireframeBackground, and other 2D canvas backgrounds.

import { useEffect, useRef } from 'react'

// ===== NAMED CONSTANTS =====

const MAX_DEVICE_PIXEL_RATIO = 2
const REDUCED_MOTION_TIME_SECONDS = 4

// ===== TYPES =====

export type Pointer = { x: number; y: number }

export type DrawFn = (
  canvasContext: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSeconds: number,
  pointer: Pointer,
) => void

// ===== MAIN FUNCTION =====

/**
 * Hook that owns canvas sizing, pointer tracking, and the animation loop.
 * Flow: 1. wire draw ref  2. resize canvas  3. loop until unmount
 */
export function useCanvasLoop(draw: DrawFn) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawCallbackRef = useRef(draw)

  useEffect(() => {
    drawCallbackRef.current = draw
  }, [draw])

  useEffect(() => {
    const canvasElement = canvasRef.current
    const canvasContext = canvasElement?.getContext('2d')
    if (!canvasElement || !canvasContext) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer: Pointer = { x: 0.5, y: 0.5 }
    let layoutWidth = 1
    let layoutHeight = 1
    let animationFrameId = 0

    // 1. Match canvas backing store to CSS size times device pixel ratio.
    const handleResize = () => {
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
      const bounds = canvasElement.getBoundingClientRect()
      layoutWidth = Math.max(1, bounds.width)
      layoutHeight = Math.max(1, bounds.height)
      canvasElement.width = layoutWidth * devicePixelRatio
      canvasElement.height = layoutHeight * devicePixelRatio
      canvasContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }

    // 2. Store pointer as normalized coordinates inside the canvas box.
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvasElement.getBoundingClientRect()
      pointer.x = (event.clientX - bounds.left) / bounds.width
      pointer.y = (event.clientY - bounds.top) / bounds.height
    }

    // 3. Invoke the latest draw callback every frame (or once when motion is reduced).
    const runFrame = (timestampMs: number) => {
      const timeSeconds = prefersReducedMotion ? REDUCED_MOTION_TIME_SECONDS : timestampMs / 1000
      drawCallbackRef.current(canvasContext, layoutWidth, layoutHeight, timeSeconds, pointer)
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(runFrame)
      }
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

  return canvasRef
}
