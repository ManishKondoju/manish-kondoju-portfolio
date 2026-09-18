/// <reference types="vite/client" />
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

/**
 * One continuous world behind the whole page, with the camera dollied through
 * it by scroll - a single stop per section.
 *
 * The rig is modelled on the Kage temple experience (ThreeUI, installed under
 * public/landing-pages/kage.html): every section carries a data-cam index, the
 * camera rides a Catmull-Rom spline through one waypoint per index, and the
 * scroll position is resolved to a fractional waypoint before being damped.
 * The damping is the part that matters - the world keeps gliding for a moment
 * after the scroll stops, which is what reads as travelling through a place
 * rather than scrolling a document.
 *
 * What is NOT borrowed is the world itself. Kage is a night temple: near-black,
 * vermilion, procedurally weathered timber and stone. This page is warm light
 * paper with one blue accent, so the same architecture carries an ink-on-paper
 * depth field instead, and the aerial perspective runs the other way - distance
 * fades to paper rather than to black.
 */

// The page's own palette. Ink tones plus the single blue accent, so the world
// is made of the same material as the type sitting on top of it.
const INK = ['#5b4f4a', '#6b5e58', '#8a7d76', '#241b19']
const ACCENT = '#5286c6'
// Matches --void. Fog resolves to the paper colour, so the far end of the
// corridor dissolves into the page instead of ending at a visible edge.
const PAPER = '#efebe8'

/* Frame-rate independent damping - the exact form Kage uses. A plain
   lerp(cur, to, 0.1) is tied to frame rate, so the same scene settles at a
   different speed on a 60Hz and a 120Hz display. */
const damp = (cur: number, to: number, rate: number, dt: number) =>
  cur + (to - cur) * (1 - Math.exp(-rate * dt))
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/* One waypoint per [data-cam] section, in document order: hero, approach,
   manifesto, work, experience, skills, evidence, contact, footer.
   The path runs forward down -z the whole way, so every section is a genuinely
   new vantage and the motes between them stream past the camera. Lateral and
   vertical drift keeps it from reading as a straight tunnel; fov opens and
   closes to breathe. */
const CAM: { p: [number, number, number]; t: [number, number, number]; fov: number }[] = [
  { p: [0.0, 0.0, 14.0], t: [0.0, 0.4, -24.0], fov: 42 }, // 0 hero
  { p: [-3.4, 1.1, 4.0], t: [1.4, -0.2, -26.0], fov: 50 }, // 1 approach
  { p: [1.8, -0.9, -6.0], t: [-1.0, 0.8, -34.0], fov: 38 }, // 2 manifesto
  { p: [4.2, 0.6, -16.0], t: [-1.8, -0.4, -44.0], fov: 46 }, // 3 work
  { p: [-2.6, -1.2, -28.0], t: [2.0, 0.6, -56.0], fov: 44 }, // 4 experience
  { p: [2.2, 1.4, -40.0], t: [-1.2, -0.6, -68.0], fov: 52 }, // 5 skills
  { p: [-1.4, -0.5, -52.0], t: [0.8, 0.9, -78.0], fov: 40 }, // 6 evidence
  { p: [0.6, 0.8, -64.0], t: [0.0, -0.3, -90.0], fov: 46 }, // 7 contact
  { p: [0.0, 2.2, -74.0], t: [0.0, -1.2, -98.0], fov: 50 }, // 8 footer
]

const Z_NEAR = 18
const Z_FAR = -104

function makeSprite() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/* The motes: ink specks scattered down the whole corridor. Normal blending,
   not additive - additive brightens, which on near-white paper means the
   particles wash out the closer they get to the camera. */
function Motes({ count, size, opacity, drift, still }: { count: number; size: number; opacity: number; drift: number; still: boolean }) {
  const sprite = useMemo(makeSprite, [])
  const group = useRef<THREE.Points>(null)

  /* Ambient life, independent of scroll. Without it the world freezes the
     moment you stop scrolling, which is the fastest way to turn a place back
     into a background image - Kage keeps leaves and wisps moving for the same
     reason. Slow enough that it never competes with the type. */
  useFrame((state, delta) => {
    if (still || !group.current) return
    const t = state.clock.elapsedTime
    group.current.position.y = Math.sin(t * 0.06) * 0.5 * drift
    group.current.position.x = Math.cos(t * 0.043) * 0.4 * drift
    group.current.rotation.z += delta * 0.004 * drift
  })

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46
      pos[i * 3 + 1] = (Math.random() - 0.5) * 26
      pos[i * 3 + 2] = Z_NEAR - Math.random() * (Z_NEAR - Z_FAR)
      // One in seven picks up the accent, so the blue reads as an occasional
      // highlight rather than a second palette.
      c.set(i % 7 === 0 ? ACCENT : INK[i % INK.length])
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [count])

  return (
    <points ref={group}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={sprite}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
        fog
      />
    </points>
  )
}

/* Strata: wide, thin rails at intervals down the corridor. Without something
   with edges, forward motion is ambiguous - a field of dots alone can read as
   drifting in place. These are what make the travel legible. */
function Strata() {
  const geometry = useMemo(() => {
    const pts: number[] = []
    const rows = 26
    for (let i = 0; i < rows; i++) {
      const z = Z_NEAR - (i / (rows - 1)) * (Z_NEAR - Z_FAR)
      // Alternating above/below the flight path, widths jittered so the
      // spacing never reads as a printed grid.
      const y = (i % 2 === 0 ? -1 : 1) * (5.4 + ((i * 37) % 11) * 0.42)
      const halfWidth = 13 + ((i * 53) % 9) * 1.15
      const x = ((i * 29) % 13) - 6
      pts.push(x - halfWidth, y, z, x + halfWidth, y, z)
      // A short cross-tick at one end gives the rail a direction.
      pts.push(x + halfWidth, y, z, x + halfWidth, y + (i % 2 === 0 ? 0.9 : -0.9), z)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={INK[0]} transparent opacity={0.22} fog />
    </lineSegments>
  )
}

function Rig({ still }: { still: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const size = useThree((state) => state.size)

  const rig = useRef({ smooth: 0, intro: 0, mx: 0, my: 0, tmx: 0, tmy: 0 })
  const anchors = useRef<number[]>([])

  const curves = useMemo(
    () => ({
      p: new THREE.CatmullRomCurve3(
        CAM.map((c) => new THREE.Vector3(...c.p)),
        false,
        'catmullrom',
        0.42,
      ),
      t: new THREE.CatmullRomCurve3(
        CAM.map((c) => new THREE.Vector3(...c.t)),
        false,
        'catmullrom',
        0.42,
      ),
    }),
    [],
  )
  const vp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), d: new THREE.Vector3() }), [])

  /* Section anchors, remeasured whenever the layout can have changed. Each
     section's midpoint is the scroll offset at which its waypoint is reached,
     which is why a section that costs more scroll (the pinned card stack) also
     gets a longer stretch of camera travel. */
  const measure = () => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-cam]'))
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const next = sections.map((el, i) => {
      if (i === 0) return 0
      if (i === sections.length - 1) return max
      const top = el.getBoundingClientRect().top + scrollNow()
      return clamp(top + el.offsetHeight * 0.5 - window.innerHeight * 0.5, 0, max)
    })
    for (let i = 1; i < next.length; i++) next[i] = Math.max(next[i], next[i - 1] + 1)
    anchors.current = next
  }

  /* ScrollSmoother owns the visual scroll position; window.scrollY runs ahead
     of what is actually on screen while it eases. Reading the smoother keeps
     the camera locked to the content the viewer can see. */
  function scrollNow() {
    const smoother = ScrollSmoother.get()
    return smoother ? smoother.scrollTop() : window.scrollY
  }

  function progressFor(y: number) {
    const a = anchors.current
    if (a.length < 2 || y <= a[0]) return 0
    for (let i = 0; i < a.length - 1; i++) {
      if (y <= a[i + 1]) return i + (y - a[i]) / (a[i + 1] - a[i])
    }
    return a.length - 1
  }

  /* Kage's aspect fix. Every waypoint is composed for a wide frame; on a tall
     one the same numbers crop badly, so the rig steps back along its own view
     axis and opens the lens rather than letting the sides fall away. */
  function fitAspect(p: THREE.Vector3, t: THREE.Vector3, fov: number) {
    const nf = clamp((1.62 - size.width / size.height) / 1.05, 0, 1)
    if (nf <= 0) return fov
    vp.d.subVectors(p, t).normalize()
    p.addScaledVector(vp.d, nf * 7.0)
    p.y += nf * 0.8
    return fov * (1 + nf * 0.4)
  }

  /* Remeasured on the same events that move the layout: fonts landing, a
     resize, and any ScrollTrigger refresh - the pinned card stack changes the
     document height by four viewports when it initialises, which moves every
     anchor after it. */
  useEffect(() => {
    measure()
    const onRefresh = () => measure()
    window.addEventListener('resize', onRefresh)
    ScrollTrigger.addEventListener('refresh', onRefresh)
    document.fonts?.ready.then(onRefresh)
    return () => {
      window.removeEventListener('resize', onRefresh)
      ScrollTrigger.removeEventListener('refresh', onRefresh)
    }
    // measure reads only refs and live layout, so it never needs re-binding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((state, delta) => {
    const r = rig.current
    const dt = Math.min(delta, 1 / 20)

    if (!anchors.current.length) measure()

    const target = progressFor(scrollNow())
    // Under reduced motion the rig tracks scroll exactly - the vantage still
    // changes per section, it just never drifts on its own.
    r.smooth = still ? target : damp(r.smooth, target, 5.2, dt)
    r.intro = still ? 1 : damp(r.intro, 1, 1.5, dt)

    r.tmx = state.pointer.x
    r.tmy = state.pointer.y
    r.mx = still ? 0 : damp(r.mx, r.tmx, 2.6, dt)
    r.my = still ? 0 : damp(r.my, r.tmy, 2.6, dt)

    const n = CAM.length - 1
    const u = clamp(r.smooth / n, 0, 1)
    curves.p.getPoint(u, vp.p)
    curves.t.getPoint(u, vp.t)

    const i = clamp(Math.floor(r.smooth), 0, n - 1)
    const f = clamp(r.smooth - i, 0, 1)
    let fov = CAM[i].fov + (CAM[i + 1].fov - CAM[i].fov) * f

    fov = fitAspect(vp.p, vp.t, fov)

    // The opening dolly: a longer lens easing in from further back, so the
    // first frame arrives rather than cuts.
    const io = 1 - r.intro
    vp.p.z += io * 5.2
    vp.p.y += io * 0.5
    fov += io * 7

    // Hand-held parallax, decaying as the journey gets under way, with the
    // look-at point counter-moving so it swivels instead of only sliding.
    const par = 1 - clamp(r.smooth / 1.6, 0, 1) * 0.55
    vp.p.x += r.mx * 0.7 * par
    vp.p.y += r.my * 0.38 * par
    vp.t.x -= r.mx * 0.22 * par
    vp.t.y -= r.my * 0.13 * par

    camera.position.copy(vp.p)
    camera.lookAt(vp.t)
    if (Math.abs(camera.fov - fov) > 1e-4) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    /* Kage publishes its own rig on window for inspection; same idea, dev only.
       Makes "is the camera actually where this section should put it" a
       question you can answer from the console. */
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__world = {
        stop: r.smooth,
        anchors: anchors.current,
        pos: camera.position.toArray().map((n) => +n.toFixed(2)),
        fov: +fov.toFixed(1),
      }
    }
  })

  return null
}

export function WorldScene({ still }: { still: boolean }) {
  return (
    <Canvas
      className="world-scene-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: CAM[0].p, fov: CAM[0].fov, near: 0.35, far: 200 }}
      frameloop={still ? 'demand' : 'always'}
    >
      {/* Aerial perspective, inverted for a light page: the far end of the
          corridor fades to paper, which is what joins the canvas to the page
          instead of leaving it sitting on top as a visible panel. */}
      <fog attach="fog" args={[PAPER, 26, 128]} />
      <Rig still={still} />
      <Strata />
      <Motes count={520} size={0.3} opacity={0.54} drift={1} still={still} />
      {/* The near layer drifts further, which reads as depth on its own. */}
      <Motes count={240} size={0.72} opacity={0.28} drift={2.1} still={still} />
    </Canvas>
  )
}
