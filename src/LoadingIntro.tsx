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
  const [alphaBroken, setAlphaBroken] = useState(false)
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

    // The count is paced by time, not by the load signals directly. Chasing
    // realProgress() made it lurch: those signals are a step function (0, .4,
    // .8, 1), so the number sprinted to each plateau then sat still waiting for
    // the next one. Here it advances on a continuous ease-out, and honesty
    // comes from the ceiling instead - it cannot reach 100 until the page is
    // actually ready, and if loading outlasts the ramp it creeps rather than
    // freezing. Monotonic by construction, so it can never tick backwards.
    const CEILING = 96
    const ticker = () => {
      const t = (performance.now() - start) / MIN_MS
      let target: number
      if (t <= 1) {
        // Smoothstep, not ease-out. Ease-out is steepest at t=0, which made the
        // count sprint 1 -> 9 -> 30 in the first 600ms before settling; this
        // eases in and out, so the cadence is even end to end.
        target = t * t * (3 - 2 * t) * CEILING
      } else {
        // Still waiting on a real signal: inch through the last few points.
        target = CEILING + Math.min(3, (t - 1) * 1.1)
      }
      counter.value = Math.max(counter.value, target)
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
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: render,
      })
        // Let 100 actually register before anything starts leaving.
        .to(root.current!.querySelector('.loading-count'), {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.inOut',
        }, '+=0.18')
        // The character is deliberately not transformed. Scaling and drifting
        // it out drew attention to the overlay leaving instead of to the page
        // arriving, and read as a lurch.
        .to(root.current, {
          opacity: 0,
          duration: 0.65,
          ease: 'power2.inOut',
          // The page behind is the same paper colour, so this dissolves the
          // character and reveals the hero rather than wiping a slab away.
          onStart: () => {
            // Released here, not on complete, so the hero animates in while the
            // overlay is still clearing - a handoff rather than a hard cut.
            window.dispatchEvent(new CustomEvent('preloader:done'))
          },
        }, '-=0.1')
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

    // Browsers disagree about transparent video: Safari decodes VP9 but drops
    // the alpha layer, which paints the cut-out region solid black. Rather than
    // predict engine behaviour, sample a corner pixel once a frame is decoded -
    // if it came back opaque, alpha is not working here and the flat poster
    // (subject already composited on the page colour) is used instead.
    const verifyAlpha = (v: HTMLVideoElement) => {
      try {
        if (!v.videoWidth) return
        const c = document.createElement('canvas')
        c.width = v.videoWidth
        c.height = v.videoHeight
        const ctx = c.getContext('2d')
        if (!ctx) return
        ctx.drawImage(v, 0, 0)
        const alpha = ctx.getImageData(4, 4, 1, 1).data[3]
        if (alpha > 40) setAlphaBroken(true)
      } catch {
        // Tainted canvas or a decoder that refuses readback: leave the video be.
      }
    }

    const video = videoRef.current
    if (!video) {
      mark('video')
    } else {
      const onReady = () => {
        verifyAlpha(video)
        mark('video')
      }
      if (video.readyState >= 3) onReady()
      else video.addEventListener('canplay', onReady, { once: true })
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
        {alphaBroken ? (
          <img className="loading-video" src="/preloader-poster.jpg" alt="" />
        ) : (
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
            {/* HEVC first, and tagged with its codec so Safari matches it.
                Safari decodes VP9 but ignores the alpha layer in WebM, so if
                the .webm came first Safari would take it and paint the
                transparent region black. Chrome and Firefox reject hvc1 and
                fall through. */}
            <source src="/preloader.mp4" type='video/mp4; codecs="hvc1"' />
            <source src="/preloader.webm" type="video/webm" />
          </video>
        )}
      </div>
      <span className="loading-count">
        <span ref={countRef}>1</span>
      </span>
    </div>
  )
}
