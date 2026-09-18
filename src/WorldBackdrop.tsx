import { Suspense, lazy, useEffect, useState } from 'react'

// Deferred so the three.js chunk never blocks first paint - the page reads fine
// on paper alone while this loads in behind it.
const WorldScene = lazy(() => import('./WorldScene').then((m) => ({ default: m.WorldScene })))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

/**
 * Mounts the page-wide world. This has to live outside #smooth-wrapper: the
 * smoother transforms its content, and a position:fixed element inside a
 * transformed ancestor is positioned against that ancestor instead of the
 * viewport - it would scroll away with the page.
 */
export function WorldBackdrop() {
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)').matches
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Desktop/tablet only. A phone gets the paper, which is the right trade for
    // battery and load time on a page this long.
    if (!wide || !supportsWebGL()) return
    setReady(true)
    setReducedMotion(still)
  }, [])

  useEffect(() => {
    if (!ready) return
    const onVis = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [ready])

  if (!ready) return null

  return (
    <div className="world-scene" aria-hidden="true">
      <Suspense fallback={null}>
        <WorldScene still={reducedMotion || !tabVisible} />
      </Suspense>
    </div>
  )
}
