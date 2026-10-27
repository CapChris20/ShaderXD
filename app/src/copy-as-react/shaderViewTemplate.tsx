// ShaderXD runtime: one shared ShaderMaterial, live preview, and the file we ship on Export.
// Flow: build uniforms → draw fullscreen quad → integrate speed into travel → optional bloom.
// Used by: sandbox tool, bare embed, site backgrounds, and the export modal (?raw).

import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'

type Param = number | string | boolean
type BloomSettings = { threshold: number; intensity: number; glowUniform?: string }
type ShaderEntry = { fragment: string; defaults: Record<string, Param>; bloom: BloomSettings }

// ===== NAMED CONSTANTS =====

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const SHADERS: Record<string, ShaderEntry> = {
  // __SHADERS__
}

const BUILT_IN_UNIFORM_NAMES: Record<string, true> = {
  u_time: true,
  u_resolution: true,
  u_look: true,
  u_travel: true,
}

const LOOK_SENSITIVITY = 0.0035
const LOOK_YAW_LIMIT = 0.9
const LOOK_PITCH_LIMIT = 0.5
const LOOK_DAMP = 4
const MAX_FRAME_DELTA_SECONDS = 0.1
const BLOOM_LUMINANCE_SMOOTHING = 0.2
const DEFAULT_DPR: [number, number] = [1, 1.5]

// ===== HELPER FUNCTIONS =====

/**
 * Convert '#ff2e88' to RGB channels in 0..1 for the GPU.
 */
function hexToRgb(hex: string): [number, number, number] {
  const asNumber = parseInt(hex.slice(1), 16)
  const red = ((asNumber >> 16) & 255) / 255
  const green = ((asNumber >> 8) & 255) / 255
  const blue = (asNumber & 255) / 255
  return [red, green, blue]
}

/**
 * Create the shared uniforms object once. Later frames mutate these values in place.
 */
function createUniforms(params: Record<string, Param>): Record<string, THREE.IUniform> {
  const uniforms: Record<string, THREE.IUniform> = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_look: { value: new THREE.Vector2() },
    u_travel: { value: 0 },
  }

  for (const [name, value] of Object.entries(params)) {
    if (name in uniforms) continue
    if (typeof value === 'string') {
      uniforms[name] = { value: new THREE.Vector3() }
    } else {
      uniforms[name] = { value }
    }
  }

  return uniforms
}

/**
 * Wire pointer drag → look target while the primary button is held.
 */
function attachMouseLook(
  canvasElement: HTMLCanvasElement,
  lookTarget: THREE.Vector2,
): () => void {
  let isButtonHeld = false
  let startX = 0
  let startY = 0

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    isButtonHeld = true
    startX = e.clientX
    startY = e.clientY
    canvasElement.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!isButtonHeld) return
    const yaw = THREE.MathUtils.clamp((e.clientX - startX) * LOOK_SENSITIVITY, -LOOK_YAW_LIMIT, LOOK_YAW_LIMIT)
    const pitch = THREE.MathUtils.clamp((startY - e.clientY) * LOOK_SENSITIVITY, -LOOK_PITCH_LIMIT, LOOK_PITCH_LIMIT)
    lookTarget.set(yaw, pitch)
  }

  const onPointerUp = (e: PointerEvent) => {
    isButtonHeld = false
    lookTarget.set(0, 0)
    if (canvasElement.hasPointerCapture(e.pointerId)) {
      canvasElement.releasePointerCapture(e.pointerId)
    }
  }

  canvasElement.addEventListener('pointerdown', onPointerDown)
  canvasElement.addEventListener('pointermove', onPointerMove)
  canvasElement.addEventListener('pointerup', onPointerUp)
  canvasElement.addEventListener('pointercancel', onPointerUp)

  return () => {
    canvasElement.removeEventListener('pointerdown', onPointerDown)
    canvasElement.removeEventListener('pointermove', onPointerMove)
    canvasElement.removeEventListener('pointerup', onPointerUp)
    canvasElement.removeEventListener('pointercancel', onPointerUp)
  }
}

/**
 * Push live control values into the shared uniforms object.
 */
function writeParamUniforms(
  uniforms: Record<string, THREE.IUniform>,
  params: Record<string, Param>,
) {
  for (const [name, value] of Object.entries(params)) {
    const uniform = uniforms[name]
    if (!uniform) continue
    if (name in BUILT_IN_UNIFORM_NAMES) continue

    if (typeof value === 'string') {
      const rgb = hexToRgb(value)
      ;(uniform.value as THREE.Vector3).set(rgb[0], rgb[1], rgb[2])
    } else {
      uniform.value = value
    }
  }
}

// ===== SCENE (inner) =====

type SceneProps = {
  fragment: string
  params: Record<string, Param>
  bloom: BloomSettings
  /** Extra travel added on top of the integrated speed, e.g. driven by page scroll. */
  travelOffset?: { current: number }
  /** Set false for decorative backgrounds: no drag-to-look, and touch scrolling passes through. */
  interactive?: boolean
}

function Scene({ fragment, params, bloom, travelOffset, interactive = true }: SceneProps) {
  const gl = useThree((state) => state.gl)
  const size = useThree((state) => state.size)

  // One shared uniforms object that we mutate every frame. Passing `uniforms` as a JSX prop
  // would make R3F copy it, and later writes would never reach the GPU.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: fragment,
        uniforms: createUniforms(params),
        depthTest: false,
        depthWrite: false,
      }),
    // Uniform names are fixed per shader; values are pushed in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fragment],
  )

  useEffect(() => () => material.dispose(), [material])

  const paramsRef = useRef(params)
  useEffect(() => {
    paramsRef.current = params
  }, [params])

  const lookTarget = useRef(new THREE.Vector2())
  useEffect(() => {
    if (!interactive) return
    return attachMouseLook(gl.domElement, lookTarget.current)
  }, [gl, interactive])

  const travelDistance = useRef(0)
  useFrame((state, delta) => {
    const uniforms = material.uniforms
    const liveParams = paramsRef.current
    const clampedDelta = Math.min(delta, MAX_FRAME_DELTA_SECONDS)
    const speed = typeof liveParams.u_speed === 'number' ? liveParams.u_speed : 0

    // u_travel integrates speed, so dragging the slider changes velocity, not position.
    travelDistance.current += clampedDelta * speed
    const scrollTravel = travelOffset?.current ?? 0

    uniforms.u_time.value = state.clock.elapsedTime
    uniforms.u_travel.value = travelDistance.current + scrollTravel

    const pixelRatio = gl.getPixelRatio()
    uniforms.u_resolution.value.set(size.width * pixelRatio, size.height * pixelRatio)

    const look = uniforms.u_look.value as THREE.Vector2
    look.x = THREE.MathUtils.damp(look.x, lookTarget.current.x, LOOK_DAMP, clampedDelta)
    look.y = THREE.MathUtils.damp(look.y, lookTarget.current.y, LOOK_DAMP, clampedDelta)

    writeParamUniforms(uniforms, liveParams)
  })

  const glowScale = bloom.glowUniform ? Number(params[bloom.glowUniform] ?? 1) : 1
  const bloomIntensity = bloom.intensity * glowScale

  return (
    <>
      <mesh frustumCulled={false} material={material}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={bloomIntensity}
          luminanceThreshold={bloom.threshold}
          luminanceSmoothing={BLOOM_LUMINANCE_SMOOTHING}
        />
      </EffectComposer>
    </>
  )
}

// ===== MAIN EXPORTS =====

export type ShaderViewProps = SceneProps & {
  className?: string
  style?: CSSProperties
  dpr?: [number, number]
  paused?: boolean
}

/**
 * Renders any fragment shader fullscreen in its parent. Parent must have a size.
 */
export function ShaderView({
  className,
  style,
  dpr = DEFAULT_DPR,
  paused = false,
  ...scene
}: ShaderViewProps) {
  const touchAction = scene.interactive === false ? 'auto' : 'none'
  const frameLoop = paused ? 'never' : 'always'

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', touchAction, ...style }}
    >
      <Canvas
        flat
        dpr={dpr}
        frameloop={frameLoop}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 1] }}
      >
        <Scene {...scene} />
      </Canvas>
    </div>
  )
}

export type ShaderXDProps = {
  shader: string
  params?: Record<string, Param>
  className?: string
  style?: CSSProperties
}

/**
 * Exported component shape: look up a baked shader id and render it.
 */
export function ShaderXD({ shader, params, className, style }: ShaderXDProps) {
  const entry = SHADERS[shader]
  if (!entry) throw new Error(`ShaderXD: unknown shader "${shader}"`)

  const mergedParams = useMemo(
    () => ({ ...entry.defaults, ...params }),
    [entry, params],
  )

  return (
    <ShaderView
      fragment={entry.fragment}
      params={mergedParams}
      bloom={entry.bloom}
      className={className}
      style={style}
    />
  )
}
