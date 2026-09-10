import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], [tabindex]'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  // Computed synchronously so the cursor markup (and its refs) exist on the
  // very first render - setting this from inside the effect instead left a
  // render where the elements didn't exist yet but the listener effect ran
  // anyway, crashing on a null ref.
  const [active] = useState(() => window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    if (!active || !dotRef.current || !ringRef.current) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dot = dotRef.current!
    const ring = ringRef.current!

    const dotTo = {
      x: gsap.quickTo(dot, 'x', { duration: reduce ? 0 : 0.1, ease: 'power3' }),
      y: gsap.quickTo(dot, 'y', { duration: reduce ? 0 : 0.1, ease: 'power3' }),
    }
    const ringTo = {
      x: gsap.quickTo(ring, 'x', { duration: reduce ? 0 : 0.35, ease: 'power3' }),
      y: gsap.quickTo(ring, 'y', { duration: reduce ? 0 : 0.35, ease: 'power3' }),
    }

    const onMove = (e: PointerEvent) => {
      dotTo.x(e.clientX)
      dotTo.y(e.clientY)
      ringTo.x(e.clientX)
      ringTo.y(e.clientY)
    }
    const onOver = (e: PointerEvent) => {
      const hit = (e.target as HTMLElement)?.closest?.(INTERACTIVE)
      ring.classList.toggle('is-hover', !!hit)
    }
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')
    const onLeaveWindow = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }
    const onEnterWindow = () => {
      dot.style.opacity = '1'
      ring.style.opacity = '1'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeaveWindow)
    document.documentElement.addEventListener('mouseenter', onEnterWindow)
    document.documentElement.classList.add('has-custom-cursor')

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow)
      document.documentElement.removeEventListener('mouseenter', onEnterWindow)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  if (!active) return null

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </div>
  )
}
