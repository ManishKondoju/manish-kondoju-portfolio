import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Video preloader with a 1-100 counter.
 *
 * The count is driven by real readiness, not a fixed timer pretending to be
 * progress: fonts, the window load event and the video's own buffering each
 * contribute a share, and the number eases toward whatever has actually landed.
 * MIN_MS stops it flashing past on a fast connection, MAX_MS guarantees it
 * always leaves even if a signal never fires.
 *
 * Content sits in the DOM underneath the whole time, so crawlers and assistive
 * tech are never blocked - this only covers it visually.
 */
const MIN_MS = 1500
const MAX_MS = 5000

export function LoadingIntro() {
  const [visible, setVisible] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const root = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!root.current) return

    const start = performance.now()
    // Weighted so the bar cannot sit at 100 while the page is still working.
    const signals = { fonts: 0, load: 0, video: 0 }
    const WEIGHT = { fonts: 0.4, load: 0.4, video: 0.2 }
    const counter = { value: 0 }
    let finished = false

    const realProgress = () =>
      signals.fonts * WEIGHT.fonts + signals.load * WEIGHT.load + signals.video * WEIGHT.video

    const render = () => {
      if (countRef.current) {
        countRef.current.textContent = String(Math.max(1, Math.round(counter.value)))
      }
    }

    // Ease toward the lower of "what has really loaded" and "how far the
    // minimum runtime has got", so it never races ahead of either.
    const ticker = () => {
      const elapsed = (performance.now() - start) / MIN_MS
      const target = Math.min(realProgress(), elapsed) * 100
      counter.value += (target - counter.value) * 0.08
      render()
    }
    gsap.ticker.add(ticker)

    const exit = () => {
      if (finished) return
      finished = true
      gsap.ticker.remove(ticker)

      const tl = gsap.timeline({
        onComplete: () => setVisible(false),
      })
      tl.to(counter, {
        value: 100,
        duration: 0.45,
        ease: 'power2.out',
        onUpdate: render,
      })
        .to(root.current!.querySelector('.loading-count'), { opacity: 0, y: -14, duration: 0.4, ease: 'power2.in' }, '-=0.1')
        .to(root.current!.querySelector('.loading-media'), { scale: 1.08, y: -18, duration: 0.8, ease: 'power2.inOut' }, '<')
        .to(root.current, {
          // Wipe up rather than a plain fade, so it hands off to the page.
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.75,
          ease: 'power3.inOut',
        }, '-=0.55')
    }

    const settle = () => {
      if (realProgress() < 1) return
      const elapsed = performance.now() - start
      window.setTimeout(exit, Math.max(0, MIN_MS - elapsed))
    }

    const mark = (key: keyof typeof signals) => {
      signals[key] = 1
      settle()
    }

    ;(document.fonts?.ready ?? Promise.resolve()).then(() => mark('fonts'))

    if (document.readyState === 'complete') mark('load')
    else window.addEventListener('load', () => mark('load'), { once: true })

    const video = videoRef.current
    if (!video) {
      mark('video')
    } else if (video.readyState >= 3) {
      mark('video')
    } else {
      video.addEventListener('canplay', () => mark('video'), { once: true })
      // A blocked or failed video must not hold the page hostage.
      video.addEventListener('error', () => mark('video'), { once: true })
      video.play().catch(() => mark('video'))
    }

    const hardStop = window.setTimeout(exit, MAX_MS)

    return () => {
      gsap.ticker.remove(ticker)
      window.clearTimeout(hardStop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div className="loading-intro" ref={root} aria-hidden="true">
      <div className="loading-media">
        {/* No src attribute - it would win over the <source> children and kill
            the mp4 fallback for browsers without VP9. */}
        <video
          ref={videoRef}
          className="loading-video"
          poster="/preloader-poster.jpg"
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
        >
          <source src="/preloader.webm" type="video/webm" />
          <source src="/preloader.mp4" type="video/mp4" />
        </video>
      </div>
      <span className="loading-count">
        <span ref={countRef}>1</span>
      </span>
    </div>
  )
}
