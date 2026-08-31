/**
 * Split an MDX article body into two segments at a sensible mid-point, so an
 * interstitial (e.g. a newsletter CTA) can be rendered between them.
 *
 * The split happens only at a top-level "## " heading that falls in the middle
 * portion of the article, and never inside a fenced code block. Returns
 * [before, after]; `after` is null when the article is too short or has no
 * safe split point (in which case the caller should render it in one piece).
 */
export function splitMdxAtMidpoint(source: string): [string, string | null] {
  const lines = source.split('\n')

  // Not worth interrupting very short articles. Measure by prose character
  // count, not line count — body paragraphs are single (long) source lines.
  const proseChars = lines
    .filter((l) => l.trim() && !/^#{1,6}\s/.test(l.trim()))
    .join(' ').length
  if (proseChars < 900) return [source, null]

  // Collect line indices of top-level h2 headings that sit outside code fences.
  let inFence = false
  let fenceChar = ''
  const headingIdxs: number[] = []

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()

    const fence = t.match(/^(`{3,}|~{3,})/)
    if (fence) {
      const c = fence[1][0]
      if (!inFence) {
        inFence = true
        fenceChar = c
      } else if (t.startsWith(fenceChar)) {
        inFence = false
      }
      continue
    }
    if (inFence) continue

    // "## " but not "### " (h3+)
    if (/^##\s+/.test(t)) headingIdxs.push(i)
  }

  if (headingIdxs.length === 0) return [source, null]

  const total = lines.length
  const mid = total / 2
  const lo = total * 0.3
  const hi = total * 0.75

  // Prefer the heading closest to the middle within the [30%, 75%] band…
  let best = -1
  let bestDist = Infinity
  for (const idx of headingIdxs) {
    if (idx < lo || idx > hi) continue
    const d = Math.abs(idx - mid)
    if (d < bestDist) {
      bestDist = d
      best = idx
    }
  }
  // …otherwise fall back to the heading nearest the middle, but never the first.
  if (best === -1) {
    for (const idx of headingIdxs) {
      if (idx === headingIdxs[0]) continue
      const d = Math.abs(idx - mid)
      if (d < bestDist) {
        bestDist = d
        best = idx
      }
    }
  }
  if (best <= 0) return [source, null]

  const before = lines.slice(0, best).join('\n').trimEnd()
  const after = lines.slice(best).join('\n').trimStart()
  if (!before.trim() || !after.trim()) return [source, null]
  return [before, after]
}
