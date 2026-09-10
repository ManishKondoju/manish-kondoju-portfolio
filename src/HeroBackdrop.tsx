import { Suspense, lazy, useEffect, useRef, useState } from 'react'

// Deferred so the three.js/@react-three/fiber chunk never blocks first paint -
// the hero reads fine from the CSS gradient alone while this loads in behind it.
const HeroScene = lazy(() => import('./HeroScene').then((m) => ({ default: m.HeroScene })))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

export function HeroBackdrop() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)').matches
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Desktop/tablet only - keeps mobile on the plain gradient for battery and
    // load time. Reduced-motion users still get the depth cue, just frozen.
    if (!wide || !supportsWebGL()) return
    setReady(true)
    setReducedMotion(still)
  }, [])

  useEffect(() => {
    if (!ready || !wrapRef.current) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    })
    io.observe(wrapRef.current)
    const onVis = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ready])

  if (!ready) return null

  return (
    <div className="hero-scene" ref={wrapRef} aria-hidden="true">
      <Suspense fallback={null}>
        <HeroScene still={reducedMotion || !inView || !tabVisible} />
      </Suspense>
    </div>
  )
}
