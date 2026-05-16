'use client'

import { useEffect, useRef } from 'react'

// Plausible custom-event helper (typed; no-ops when Plausible isn't loaded)
function plausible(event: string, props?: Record<string, string>) {
  ;(window as unknown as { plausible?: (e: string, o?: { props?: Record<string, string> }) => void })
    .plausible?.(event, props ? { props } : undefined)
}

interface ReadingProgressProps {
  /** When provided, fires Plausible events at 50 % and 100 % scroll */
  articleSlug?: string
}

/**
 * Reading progress bar — fills from left as the user scrolls the page.
 * Uses direct DOM mutation (no state) so scroll events never trigger
 * a React re-render.
 *
 * - Bar:        smooth ease-out CSS transition
 * - Percentage: fades in once reading begins (1–99 %), fades out at 0 / 100 %
 * - Analytics:  fires Plausible "Article Read 50%" and "Article Completed"
 */
export function ReadingProgress({ articleSlug }: ReadingProgressProps) {
  const barRef  = useRef<HTMLSpanElement>(null)
  const pctRef  = useRef<HTMLSpanElement>(null)
  const fired50  = useRef(false)
  const fired100 = useRef(false)

  useEffect(() => {
    function update() {
      const docEl   = document.documentElement
      const scrolled = docEl.scrollTop || document.body.scrollTop
      const total    = docEl.scrollHeight - docEl.clientHeight
      const progress = total > 0 ? Math.min(scrolled / total, 1) : 0

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`
      }

      if (pctRef.current) {
        const p = Math.round(progress * 100)
        pctRef.current.textContent = `${p}%`
        pctRef.current.style.opacity = p > 0 && p < 100 ? '1' : '0'

        // Plausible milestones
        if (articleSlug) {
          if (p >= 50 && !fired50.current) {
            fired50.current = true
            plausible('Article Read 50%', { slug: articleSlug })
          }
          if (p >= 100 && !fired100.current) {
            fired100.current = true
            plausible('Article Completed', { slug: articleSlug })
          }
        }
      }
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [articleSlug])

  return (
    <>
      <div className="reading-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>
      <span ref={pctRef} className="reading-progress-pct" aria-hidden="true" />
    </>
  )
}
