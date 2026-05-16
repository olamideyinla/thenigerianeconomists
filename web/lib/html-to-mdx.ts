/**
 * HTML → MDX converter shared between the submission-to-article pipeline
 * and the article editor's "Fix HTML" action.
 *
 * Converts Tiptap/Word/Google-Docs HTML to clean MDX-safe Markdown.
 * Tables become GFM pipe tables; literal `<` characters are escaped
 * with `\<` so MDX doesn't mistake them for JSX element openers.
 */

/** Strip all HTML tags; return plain text. */
export function innerText(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim()
}

/** Decode common HTML entities to their Unicode characters. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ldquo;|&#8220;/g, '\u201c')
    .replace(/&rdquo;|&#8221;/g, '\u201d')
    .replace(/&lsquo;|&#8216;/g, '\u2018')
    .replace(/&rsquo;|&#8217;/g, '\u2019')
    .replace(/&mdash;|&#8212;/g, '\u2014')
    .replace(/&ndash;|&#8211;/g, '\u2013')
    .replace(/&hellip;|&#8230;/g, '\u2026')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&[a-zA-Z]+;/g, ' ')
}

/** Inline-format table cell content for GFM pipe tables. */
function tableCell(html: string): string {
  const text = decodeEntities(
    html
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  ).trim()
  return text.replace(/\|/g, '\\|').replace(/\n+/g, ' ')
}

/** Convert an HTML <table> to a GFM pipe table. */
function convertTable(tableHtml: string): string {
  const rows: string[][] = []
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rowM: RegExpExecArray | null
  while ((rowM = rowRe.exec(tableHtml)) !== null) {
    const cells: string[] = []
    const cellRe = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi
    let cellM: RegExpExecArray | null
    while ((cellM = cellRe.exec(rowM[1])) !== null) {
      cells.push(tableCell(cellM[1]))
    }
    if (cells.length) rows.push(cells)
  }
  if (!rows.length) return ''

  const cols = Math.max(...rows.map((r) => r.length))
  const pad = (row: string[]) => [...row, ...Array(cols - row.length).fill('')]

  return '\n\n' + [
    '| ' + pad(rows[0]).join(' | ') + ' |',
    '| ' + Array(cols).fill('---').join(' | ') + ' |',
    ...rows.slice(1).map((r) => '| ' + pad(r).join(' | ') + ' |'),
  ].join('\n') + '\n\n'
}

/** Convert an HTML <ol> to a numbered Markdown list. */
function convertOl(olHtml: string): string {
  let n = 0
  return '\n' + olHtml.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => {
    n++
    return `${n}. ${innerText(inner)}\n`
  }) + '\n'
}

/**
 * Convert HTML (from Tiptap or Word/Google Docs paste) to MDX-safe Markdown.
 *
 * Input must be raw HTML.  For already-converted MDX content use sanitizeMdx.
 */
export function htmlToMdx(html: string): string {
  let s = html

  // 1. Tables → GFM pipe tables
  s = s.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, inner) => convertTable(inner))

  // 2. Ordered lists
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => convertOl(inner))

  // 3. Unordered lists
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) =>
    '\n' + inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, li: string) => `- ${innerText(li)}\n`) + '\n'
  )

  // 4. Block elements
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${innerText(t)}\n\n`)
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${innerText(t)}\n\n`)
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${innerText(t)}\n\n`)
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${innerText(t)}\n\n`)
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const text = innerText(inner)
    return '\n\n> ' + text.split('\n').join('\n> ') + '\n\n'
  })
  s = s.replace(/<\/p>/gi, '\n\n')
  s = s.replace(/<p[^>]*>/gi, '')
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<hr[^>]*>/gi, '\n\n---\n\n')

  // 5. Inline marks
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, t) => `**${innerText(t)}**`)
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, t) => `**${innerText(t)}**`)
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, t) => `*${innerText(t)}*`)
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, t) => `*${innerText(t)}*`)
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${innerText(t)}\``)

  // 6. Convert images to Markdown syntax (preserves src and alt text).
  //    Self-closing <img> and <img></img> variants are both handled.
  s = s.replace(/<img\s[^>]*\/?>/gi, (tag) => {
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1] ?? ''
    const alt = tag.match(/alt=["']([^"']*?)["']/i)?.[1] ?? ''
    if (!src) return ''
    return `\n\n![${alt}](${src})\n\n`
  })

  // 7. Strip ALL remaining HTML tags
  s = s.replace(/<[^>]+>/g, '')

  // 8. Decode HTML entities (may re-introduce `<` from &lt;)
  s = decodeEntities(s)

  // 9. Escape bare `<` for MDX.
  //    After stripping all tags and decoding entities, any remaining `<`
  //    is a literal less-than character in text (e.g. "GDP fell <3%").
  //    MDX's JSX parser errors on `<` followed by a digit or unexpected char.
  //    The correct MDX-safe encoding is the HTML entity `&lt;` — Markdown
  //    and React both decode it to `<` at render time.  (`\<` does NOT work
  //    with the MDX/acorn JSX parser in next-mdx-remote.)
  s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 10. Normalise whitespace
  s = s.replace(/\n{3,}/g, '\n\n').trim()

  return s
}

/**
 * Sanitise already-converted MDX that may contain:
 *   - Old `\<` / `\>` backslash-escape artefacts (wrong for the MDX/acorn JSX parser)
 *   - Residual raw HTML blocks (tables, headings, etc.) not caught by an earlier run
 *   - Bare `<digit` sequences that confuse the MDX JSX parser
 *
 * Unlike htmlToMdx (which expects raw HTML input), this function is safe to
 * run on content that is already mostly Markdown.  It is idempotent on clean MDX.
 *
 * Use this in fixArticleMdx; use htmlToMdx when converting a fresh HTML submission.
 */
export function sanitizeMdx(mdx: string): string {
  let s = mdx

  // 1. Fix old backslash-escape artefacts produced by an earlier converter version.
  //    \< / \> are NOT valid MDX escapes — the acorn JSX parser still sees <digit
  //    and throws "Unexpected character".  Replace with HTML entities instead.
  s = s.replace(/\\</g, '&lt;').replace(/\\>/g, '&gt;')

  // 2. Convert any residual raw HTML tables → GFM pipe tables
  s = s.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, inner) => convertTable(inner))

  // 3. Convert residual HTML block / inline elements to Markdown equivalents
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${innerText(t)}\n\n`)
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${innerText(t)}\n\n`)
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${innerText(t)}\n\n`)
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${innerText(t)}\n\n`)
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const text = innerText(inner)
    return '\n\n> ' + text.split('\n').join('\n> ') + '\n\n'
  })
  s = s.replace(/<\/p>/gi, '\n\n')
  s = s.replace(/<p[^>]*>/gi, '')
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, t) => `**${innerText(t)}**`)
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, t) => `**${innerText(t)}**`)
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, t) => `*${innerText(t)}*`)
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, t) => `*${innerText(t)}*`)
  // Convert images to Markdown syntax instead of stripping.
  s = s.replace(/<img\s[^>]*\/?>/gi, (tag) => {
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1] ?? ''
    const alt = tag.match(/alt=["']([^"']*?)["']/i)?.[1] ?? ''
    if (!src) return ''
    return `\n\n![${alt}](${src})\n\n`
  })

  // 4. Strip remaining lowercase HTML tags.
  //    The regex only matches tags that start with a lowercase letter, so
  //    PascalCase JSX components like <Figure id="…" /> are preserved.
  s = s.replace(/<\/?[a-z][a-z0-9-]*(\s[^>]*)?\s*\/?>/g, '')

  // 5. Decode safe HTML entities — but intentionally leave &lt; / &gt; alone so
  //    they remain valid MDX-safe escapes for literal angle brackets in text.
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ldquo;|&#8220;/g, '\u201c')
    .replace(/&rdquo;|&#8221;/g, '\u201d')
    .replace(/&lsquo;|&#8216;/g, '\u2018')
    .replace(/&rsquo;|&#8217;/g, '\u2019')
    .replace(/&mdash;|&#8212;/g, '\u2014')
    .replace(/&ndash;|&#8211;/g, '\u2013')
    .replace(/&hellip;|&#8230;/g, '\u2026')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))

  // 6. Escape any remaining bare `<` that would trip the MDX/acorn JSX parser.
  //    PascalCase JSX components (<Figure, </Figure) are preserved because they
  //    start with an uppercase letter or a slash (negative lookahead).
  //    Everything else (<3%, <30, <!--, etc.) becomes &lt;.
  s = s.replace(/<(?![A-Z/])/g, '&lt;')

  // 7. Escape bare single-brace { } expressions that MDX would try to evaluate
  //    as JSX (e.g. "{GDP}" causes "GDP is not defined" compile error).
  //    Must run AFTER entity decoding (step 5) so &#123; from prior runs isn't
  //    decoded back to { and then re-escaped in an infinite loop.
  //    Double-brace citation tokens {{N}} are intentionally preserved —
  //    preprocessCitations converts them to <Citation n={N} /> at compile time.
  s = s.replace(/(?<!\{)\{(?!\{)([^}\n]*)\}/g, '&#123;$1&#125;')

  // 8. Normalise whitespace
  s = s.replace(/\n{3,}/g, '\n\n').trim()

  return s
}
