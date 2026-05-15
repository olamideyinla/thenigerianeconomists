/**
 * Tests for web/lib/remark-directives.ts
 *
 * Strategy: run remark-parse → remark-directive → remarkDirectives
 * and inspect the resulting AST for mdxJsxFlowElement nodes.
 */

import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import { remarkDirectives } from '../lib/remark-directives'
import type { Root } from 'mdast'

// ─── Helpers ──────────────────────────────────────────────────────

// NOTE: remark-mdx is deliberately excluded — it would parse `{id="abc"}`
// directive attribute syntax as JSX before remark-directive gets to it.
// NOTE on .runSync: both remark-directive and remarkDirectives are
// transformers; they run during .run(), NOT during .parse().
function parseWithDirectives(md: string): Root {
  const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkDirectives)
  const tree = processor.parse(md)
  return processor.runSync(tree) as Root
}

function collectJsx(tree: unknown): Array<{
  type: string
  name: string
  attributes: Array<{ name: string; value: unknown }>
  children: unknown[]
}> {
  const results: ReturnType<typeof collectJsx> = []
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return
    const n = node as {
      type: string
      name?: string
      attributes?: unknown[]
      children?: unknown[]
    }
    if (n.type === 'mdxJsxFlowElement') {
      results.push(n as ReturnType<typeof collectJsx>[0])
    }
    if (n.children) n.children.forEach(walk)
  }
  walk(tree)
  return results
}

// ─── Tests ────────────────────────────────────────────────────────

describe('remarkDirectives', () => {
  // ── pullquote ──────────────────────────────────────────────────

  it('transforms :::pullquote into <Pullquote>', () => {
    const tree = parseWithDirectives(
      ':::pullquote\nA clearing burst is the signature of a fixing.\n:::'
    )
    const jsxNodes = collectJsx(tree)
    const pq = jsxNodes.find((n) => n.name === 'Pullquote')
    expect(pq).toBeDefined()
    expect(pq!.attributes).toHaveLength(0)
    // Content should be non-empty
    expect(pq!.children.length).toBeGreaterThan(0)
  })

  it('pullquote unwraps paragraph — children are inline nodes, not a paragraph wrapper', () => {
    const tree = parseWithDirectives(
      ':::pullquote\nQuoted text.\n:::'
    )
    const jsxNodes = collectJsx(tree)
    const pq = jsxNodes.find((n) => n.name === 'Pullquote')!
    // The single child should NOT be a paragraph node
    expect((pq.children[0] as { type: string }).type).not.toBe('paragraph')
    // It should be a text node (or similar inline)
    expect((pq.children[0] as { type: string }).type).toBe('text')
  })

  // ── rebutted ───────────────────────────────────────────────────

  it('transforms :::rebutted into <RebuttedParagraph>', () => {
    const tree = parseWithDirectives(
      ':::rebutted\nThis claim is contested.\n:::'
    )
    const jsxNodes = collectJsx(tree)
    const rb = jsxNodes.find((n) => n.name === 'RebuttedParagraph')
    expect(rb).toBeDefined()
  })

  it('rebutted unwraps paragraph children', () => {
    const tree = parseWithDirectives(
      ':::rebutted\nContested text.\n:::'
    )
    const jsxNodes = collectJsx(tree)
    const rb = jsxNodes.find((n) => n.name === 'RebuttedParagraph')!
    expect((rb.children[0] as { type: string }).type).toBe('text')
  })

  // ── dropcap ────────────────────────────────────────────────────

  it('transforms :::dropcap into <Dropcap>', () => {
    const tree = parseWithDirectives(
      ':::dropcap\nThe opening paragraph.\n:::'
    )
    const jsxNodes = collectJsx(tree)
    const dc = jsxNodes.find((n) => n.name === 'Dropcap')
    expect(dc).toBeDefined()
  })

  // ── figure ─────────────────────────────────────────────────────

  it('transforms :::figure{id="fig-nafem-table-01"}::: into <Figure id="..." />', () => {
    const tree = parseWithDirectives(
      ':::figure{id="fig-nafem-table-01"}\n:::'
    )
    const jsxNodes = collectJsx(tree)
    const fig = jsxNodes.find((n) => n.name === 'Figure')
    expect(fig).toBeDefined()

    const idAttr = fig!.attributes.find((a) => a.name === 'id')
    expect(idAttr).toBeDefined()
    expect(idAttr!.value).toBe('fig-nafem-table-01')

    // Self-closing: no children
    expect(fig!.children).toHaveLength(0)
  })

  it('figure without id is removed from the tree gracefully', () => {
    const tree = parseWithDirectives(':::figure\n:::')
    const jsxNodes = collectJsx(tree)
    const fig = jsxNodes.find((n) => n.name === 'Figure')
    expect(fig).toBeUndefined()
    // The tree still has other nodes (the root), no crash
    expect(tree).toBeDefined()
  })

  it('ignores unknown directive names', () => {
    const tree = parseWithDirectives(':::unknown\nsome text\n:::')
    // Should parse fine without throwing; no mdxJsxFlowElement for it
    const jsxNodes = collectJsx(tree)
    expect(jsxNodes.find((n) => n.name === 'Unknown')).toBeUndefined()
  })

  // ── leafDirective for figure ───────────────────────────────────

  it('handles leaf directive syntax ::figure{id="fig-x"} too', () => {
    const tree = parseWithDirectives('::figure{id="fig-x"}')
    const jsxNodes = collectJsx(tree)
    const fig = jsxNodes.find((n) => n.name === 'Figure')
    expect(fig).toBeDefined()
    const idAttr = fig!.attributes.find((a) => a.name === 'id')
    expect(idAttr!.value).toBe('fig-x')
  })

  // ── interaction with citations (order safety) ──────────────────

  it('works alongside remarkCitations in the same pipeline', async () => {
    const { remarkCitations } = await import('../lib/remark-citations')
    const processor = unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkCitations)
      .use(remarkDirectives)
    const raw = processor.parse(':::pullquote\nA burst {{1}} is a fixing.\n:::')
    const tree = processor.runSync(raw) as Root

    const jsxNodes = collectJsx(tree)
    const pq = jsxNodes.find((n) => n.name === 'Pullquote')
    expect(pq).toBeDefined()

    // The Citation element should also be present inside the Pullquote
    function findCitations(node: unknown): unknown[] {
      const results: unknown[] = []
      function walk(n: unknown) {
        if (!n || typeof n !== 'object') return
        const o = n as { type: string; children?: unknown[] }
        if (o.type === 'mdxJsxTextElement') results.push(o)
        if (o.children) o.children.forEach(walk)
      }
      walk(node)
      return results
    }
    const cites = findCitations(pq)
    expect(cites.length).toBeGreaterThan(0)
  })
})
