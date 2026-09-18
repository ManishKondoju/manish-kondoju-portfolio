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
