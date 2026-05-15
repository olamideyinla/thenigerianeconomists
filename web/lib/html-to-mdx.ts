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
 * Also works as a "sanitiser" for MDX that already contains raw HTML
 * remnants — running it again is idempotent on clean Markdown.
 */
export function htmlToMdx(html: string): string {
  let s = html

  // 1. Tables → GFM pipe tables
  s = s.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, inner) => convertTable(inner))

  // 2. Ordered lists
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => convertOl(inner))

  // 3. Unordered lists
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) =>
    '\n' + inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (__, li) => `- ${innerText(li)}\n`) + '\n'
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

  // 6. Remove images (editors re-attach via the Figures panel)
  s = s.replace(/<img[^>]*>/gi, '')

  // 7. Strip ALL remaining HTML tags
  s = s.replace(/<[^>]+>/g, '')

  // 8. Decode HTML entities (may re-introduce `<` from &lt;)
  s = decodeEntities(s)

  // 9. Escape bare `<` for MDX.
  //    After stripping tags, any remaining `<` is literal text content.
  //    MDX tries to parse `<` as a JSX element opener and errors if it can't.
  //    `\<` is the correct MDX escape for a literal less-than sign.
  s = s.replace(/</g, '\\<')

  // 10. Normalise whitespace
  s = s.replace(/\n{3,}/g, '\n\n').trim()

  return s
}
