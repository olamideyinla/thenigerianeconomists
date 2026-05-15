'use client'

import { useEffect, useRef } from 'react'

/**
 * Reading progress bar — fills from left as the user scrolls the page.
 * Uses a passive scroll listener to update a CSS transform; no reflow.
 */
export function ReadingProgress() {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const span = spanRef.current
    if (!span) return

    function update() {
      const docEl = document.documentElement
      const scrolled = docEl.scrollTop || document.body.scrollTop
      const total = docEl.scrollHeight - docEl.clientHeight
      const progress = total > 0 ? Math.min(scrolled / total, 1) : 0
      if (span) span.style.transform = `scaleX(${progress})`
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="reading-progress" aria-hidden="true">
      <span ref={spanRef} />
    </div>
  )
}
