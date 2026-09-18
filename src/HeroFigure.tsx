import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * The hero figure, with eyes that track the cursor.
 *
 * The irises were painted out of the source image offline and the eye whites
 * reconstructed, so what moves here is drawn on top in SVG. Each iris is
 * clipped to its own eye opening (traced from the image), which is what stops
 * it sliding onto the eyelid or out through the glasses frame at the extremes.
 *
 * Skipped entirely on coarse pointers and under reduced motion - there is no
 * cursor to follow on a touch screen, and the static figure reads fine.
 */

const FIG = { w: 842, h: 1402 }

const EYES = [
  { id: 'l', cx: 350, cy: 504, r: 35, clip: '302,463 304,462 306,460 308,459 310,457 312,456 314,455 316,454 318,453 320,452 322,451 324,450 326,450 328,450 330,450 332,450 334,450 336,450 338,450 340,450 342,450 344,450 346,450 348,450 350,450 352,450 354,450 356,450 358,450 360,450 362,450 364,450 366,451 368,451 370,452 372,453 374,454 376,456 378,457 380,458 382,460 384,462 386,463 388,465 390,467 392,470 394,474 396,477 398,482 400,492 400,499 398,510 396,514 394,546 392,548 390,549 388,551 386,552 384,553 382,554 380,555 378,556 376,557 374,557 372,557 370,557 368,557 366,557 364,557 362,557 360,557 358,557 356,557 354,557 352,557 350,557 348,557 346,557 344,557 342,557 340,557 338,557 336,557 334,557 332,557 330,557 328,557 326,557 324,557 322,557 320,557 318,557 316,557 314,557 312,557 310,557 308,557 306,557 304,557 302,556' },
  { id: 'r', cx: 539, cy: 487, r: 33, clip: '504,475 506,451 508,444 510,444 512,444 514,444 516,444 518,444 520,444 522,444 524,444 526,444 528,444 530,444 532,444 534,444 536,444 538,444 540,444 542,444 544,444 546,444 548,444 550,444 552,444 554,444 556,444 558,444 560,444 562,444 564,444 566,444 568,444 570,444 572,444 574,444 576,444 578,444 580,444 582,444 584,444 586,444 588,444 590,444 592,444 594,445 596,448 596,535 594,535 592,535 590,535 588,535 586,535 584,535 582,535 580,535 578,535 576,535 574,535 572,535 570,535 568,535 566,535 564,535 562,535 560,535 558,535 556,535 554,535 552,535 550,535 548,535 546,535 544,535 542,535 540,533 538,532 536,531 534,529 532,527 530,526 528,524 526,524 524,523 522,521 520,518 518,517 516,515 514,514 512,512 510,509 508,507 506,503 504,499' },
]

// How far an iris may leave centre, in image units. Kept well inside the
// sclera so the eye never reads as "escaping" the socket.
const TRAVEL_X = 13
const TRAVEL_Y = 9

export function HeroFigure() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || still || !root.current) return

    const groups = EYES.map((e) =>
      root.current!.querySelector<SVGGElement>(`[data-eye="${e.id}"]`),
    ).filter(Boolean) as SVGGElement[]
    if (groups.length !== EYES.length) return

    const movers = groups.map((el) => ({
      x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' }),
    }))

    const onMove = (event: PointerEvent) => {
      const box = root.current?.getBoundingClientRect()
      if (!box) return
      // Measured from the face rather than the viewport centre, so the gaze
      // reads as aimed at the cursor instead of merely drifting with it.
      const originX = box.left + box.width * 0.5
      const originY = box.top + box.height * 0.28
      const nx = gsap.utils.clamp(-1, 1, (event.clientX - originX) / (window.innerWidth * 0.4))
      const ny = gsap.utils.clamp(-1, 1, (event.clientY - originY) / (window.innerHeight * 0.4))
      movers.forEach((m) => {
        m.x(nx * TRAVEL_X)
        m.y(ny * TRAVEL_Y)
      })
    }
    const recentre = () => movers.forEach((m) => { m.x(0); m.y(0) })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseleave', recentre)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', recentre)
    }
  }, [])

  return (
    <div className="hero-figure" ref={root}>
      <img
        src="/hero-figure.webp"
        width={FIG.w}
        height={FIG.h}
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      <svg
        className="hero-figure-eyes"
        viewBox={`0 0 ${FIG.w} ${FIG.h}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="hf-iris" cx="42%" cy="35%" r="72%">
            <stop offset="0%" stopColor="#8a4a31" />
            <stop offset="58%" stopColor="#612f20" />
            <stop offset="100%" stopColor="#3d1d14" />
          </radialGradient>
          {EYES.map((e) => (
            <clipPath id={`hf-clip-${e.id}`} key={e.id}>
              <polygon points={e.clip} />
            </clipPath>
          ))}
        </defs>

        {EYES.map((e) => (
          <g clipPath={`url(#hf-clip-${e.id})`} key={e.id}>
            <g data-eye={e.id}>
              <circle cx={e.cx} cy={e.cy} r={e.r} fill="url(#hf-iris)" />
              <circle
                cx={e.cx}
                cy={e.cy}
                r={e.r}
                fill="none"
                stroke="#47251a"
                strokeOpacity="0.85"
                strokeWidth={e.r * 0.1}
              />
              <circle cx={e.cx} cy={e.cy} r={e.r * 0.42} fill="#040202" />
              <ellipse
                cx={e.cx + e.r * 0.34}
                cy={e.cy - e.r * 0.42}
                rx={e.r * 0.19}
                ry={e.r * 0.14}
                fill="#ffffff"
                opacity="0.96"
                transform={`rotate(-20 ${e.cx + e.r * 0.34} ${e.cy - e.r * 0.42})`}
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}
