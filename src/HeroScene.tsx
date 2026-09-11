import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ambient WebGL backdrop for the hero. Two depth-layered point clouds drift
 * slowly and lean toward the pointer, standing in for the "3D portfolio"
 * feel without a modeled/rigged character (out of scope - see chat).
 */

// One accent, page-wide. The old blue/violet/cyan mix was the generic
// "AI gradient" palette; particles are now off-white with acid highlights.
const PALETTE = ['#f3f2ef', '#f3f2ef', '#8f8f8a', '#d7f85c', '#d7f85c']

function makeSprite() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.7)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function Layer({
  count,
  spread,
  z,
  size,
  speed,
  parallax,
  still,
}: {
  count: number
  spread: [number, number, number]
  z: number
  size: number
  speed: number
  parallax: number
  still: boolean
}) {
  const points = useRef<THREE.Points>(null)
  const sprite = useMemo(makeSprite, [])

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread[0]
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1]
      pos[i * 3 + 2] = z + (Math.random() - 0.5) * spread[2]
      c.set(PALETTE[i % PALETTE.length])
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [count, spread, z])

  useFrame((state, delta) => {
    if (still || !points.current) return
    points.current.rotation.y += delta * speed
    const { pointer } = state
    // Ease toward the pointer rather than snapping, so it reads as drifting.
    points.current.position.x += (pointer.x * parallax - points.current.position.x) * 0.03
    points.current.position.y += (pointer.y * parallax * 0.6 - points.current.position.y) * 0.03
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={sprite}
        vertexColors
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

function Rig({ still }: { still: boolean }) {
  const { camera } = useThree()
  useFrame((state) => {
    if (still) return
    // Subtle camera lean - the parallax cue reads as "3D" without moving content.
    camera.position.x += (state.pointer.x * 0.6 - camera.position.x) * 0.02
    camera.position.y += (state.pointer.y * 0.35 - camera.position.y) * 0.02
    camera.lookAt(0, 0, 0)
  })
  return null
}

export function HeroScene({ still }: { still: boolean }) {
  return (
    <Canvas
      className="hero-scene-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 9], fov: 45 }}
      frameloop={still ? 'demand' : 'always'}
    >
      <Rig still={still} />
      <Layer count={90} spread={[16, 9, 4]} z={-1} size={0.22} speed={0.03} parallax={0.8} still={still} />
      <Layer count={55} spread={[20, 11, 6]} z={-5} size={0.34} speed={0.018} parallax={1.6} still={still} />
    </Canvas>
  )
}
