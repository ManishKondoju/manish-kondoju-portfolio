import { useEffect, useState } from 'react'

/**
 * A brief reveal, not a fake progress bar - it waits on real readiness
 * (webfont + first paint) and never blocks content from the DOM/crawlers,
 * just covers it visually for at most ~900ms. A safety timeout guarantees
 * it clears even if a signal never fires.
 */
const MIN_MS = 260
const MAX_MS = 900

export function LoadingIntro() {
  const [phase, setPhase] = useState<'show' | 'leaving' | 'gone'>('show')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('gone')
      return
    }

    const start = performance.now()
    let done = false

    const finish = () => {
      if (done) return
      done = true
      const elapsed = performance.now() - start
      const wait = Math.max(0, MIN_MS - elapsed)
      window.setTimeout(() => {
        setPhase('leaving')
        window.setTimeout(() => setPhase('gone'), 500)
      }, wait)
    }

    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    Promise.race([
      fontsReady,
      new Promise((resolve) => window.setTimeout(resolve, MAX_MS)),
    ]).then(finish)

    const safety = window.setTimeout(finish, MAX_MS + 200)
    return () => window.clearTimeout(safety)
  }, [])

  if (phase === 'gone') return null

  return (
    <div className={`loading-intro${phase === 'leaving' ? ' is-leaving' : ''}`} aria-hidden="true">
      <span className="loading-mark">MK</span>
    </div>
  )
}
