'use client'

import { useEffect, useRef } from 'react'

/**
 * Reading progress bar — fills from left as the user scrolls the page.
 * Uses direct DOM mutation (no state) so scroll events never trigger
 * a React re-render.
 *
 * - Bar:        smooth ease-out CSS transition
 * - Percentage: fades in once reading begins (1–99 %), fades out at 0 / 100 %
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    function update() {
      const docEl = document.documentElement
      const scrolled = docEl.scrollTop || document.body.scrollTop
      const total = docEl.scrollHeight - docEl.clientHeight
      const progress = total > 0 ? Math.min(scrolled / total, 1) : 0

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`
      }

      if (pctRef.current) {
        const p = Math.round(progress * 100)
        pctRef.current.textContent = `${p}%`
        pctRef.current.style.opacity = p > 0 && p < 100 ? '1' : '0'
      }
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <div className="reading-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>
      <span ref={pctRef} className="reading-progress-pct" aria-hidden="true" />
    </>
  )
}
