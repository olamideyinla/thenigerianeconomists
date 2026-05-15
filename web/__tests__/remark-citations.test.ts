/**
 * Tests for web/lib/remark-citations.ts
 *
 * Strategy: build a minimal unified pipeline (remark-parse → our plugin)
 * and inspect the resulting MDAST for mdxJsxTextElement nodes.
 */

import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { remarkCitations } from '../lib/remark-citations'
import type { Root } from 'mdast'

// ─── Helpers ──────────────────────────────────────────────────────

// NOTE: we intentionally do NOT use remark-mdx here.
// remark-mdx intercepts `{...}` as JSX expressions during parsing,
// which would consume `{{N}}` before our transformer can see it.
// The production pipeline handles this via string-level pre-processing
// (see lib/mdx.ts → preprocessCitations). The remark plugin itself
// is valid for non-MDX unified pipelines.
//
// NOTE on .runSync: remarkCitations is a transformer (returns a function),
// so it runs during .run()/.process(), NOT during .parse().  We must call
// processor.runSync(tree) explicitly after parsing.
function parseWithCitations(md: string): Root {
  const processor = unified().use(remarkParse).use(remarkCitations)
  const tree = processor.parse(md)
  return processor.runSync(tree) as Root
}

/** Collect all nodes of a given type from a tree (depth-first). */
function collectNodes(tree: unknown, type: string): unknown[] {
  const results: unknown[] = []
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return
    const n = node as { type: string; children?: unknown[] }
    if (n.type === type) results.push(n)
    if (n.children) n.children.forEach(walk)
  }
  walk(tree)
  return results
}

/** Get the first paragraph's children array. */
function firstParaChildren(tree: Root): unknown[] {
  const para = (tree as unknown as { children: unknown[] }).children[0]
  const p = para as { children: unknown[] }
  return p?.children ?? []
}

// ─── Tests ────────────────────────────────────────────────────────

describe('remarkCitations', () => {
  it('transforms a single {{1}} into a Citation element', () => {
    const tree = parseWithCitations('See the note {{1}} here.')
    const citations = collectNodes(tree, 'mdxJsxTextElement') as Array<{
      name: string
      attributes: Array<{ name: string; value: unknown }>
    }>

    expect(citations).toHaveLength(1)
    expect(citations[0].name).toBe('Citation')

    const attr = citations[0].attributes[0]
    expect(attr.name).toBe('n')
    // The value is an mdxJsxAttributeValueExpression with value '1'
    const val = attr.value as { value: string }
    expect(val.value).toBe('1')
  })

  it('transforms multiple citations in the same paragraph', () => {
    const tree = parseWithCitations('See {{1}} and {{2}} and {{3}}.')
    const citations = collectNodes(tree, 'mdxJsxTextElement')
    expect(citations).toHaveLength(3)
  })

  it('preserves surrounding text as text nodes', () => {
    const tree = parseWithCitations('Before {{1}} after.')
    const children = firstParaChildren(tree)
    // Expect: [text, Citation, text]
    expect(children).toHaveLength(3)
    expect((children[0] as { type: string; value: string }).type).toBe('text')
    expect((children[0] as { type: string; value: string }).value).toBe('Before ')
    expect((children[1] as { type: string }).type).toBe('mdxJsxTextElement')
    expect((children[2] as { type: string; value: string }).value).toBe(' after.')
  })

  it('leaves {{0}} (zero) as plain text — not a positive integer', () => {
    const tree = parseWithCitations('See {{0}} here.')
    const citations = collectNodes(tree, 'mdxJsxTextElement')
    expect(citations).toHaveLength(0)
    // The original text must survive unchanged
    const texts = collectNodes(tree, 'text') as Array<{ value: string }>
    const joined = texts.map((t) => t.value).join('')
    expect(joined).toContain('{{0}}')
  })

  it('leaves {{abc}} (non-numeric) as plain text', () => {
    const tree = parseWithCitations('See {{abc}} here.')
    const citations = collectNodes(tree, 'mdxJsxTextElement')
    expect(citations).toHaveLength(0)
    const texts = collectNodes(tree, 'text') as Array<{ value: string }>
    const joined = texts.map((t) => t.value).join('')
    expect(joined).toContain('{{abc}}')
  })

  it('handles out-of-range N (e.g. {{9999}}) — still creates a Citation (range validated at render)', () => {
    const tree = parseWithCitations('See {{9999}}.')
    const citations = collectNodes(tree, 'mdxJsxTextElement') as Array<{
      name: string
      attributes: Array<{ value: { value: string } }>
    }>
    expect(citations).toHaveLength(1)
    expect(citations[0].attributes[0].value.value).toBe('9999')
  })

  it('does NOT touch content inside fenced code blocks', () => {
    const tree = parseWithCitations(
      'Normal text.\n\n```js\nconst x = {{1}}\n```\n\nAfter.'
    )
    const citations = collectNodes(tree, 'mdxJsxTextElement')
    // Code block content is in a `code` node's .value, not a child text node
    expect(citations).toHaveLength(0)
  })

  it('does NOT touch content inside inline code', () => {
    const tree = parseWithCitations('The token `{{1}}` is literal.')
    const citations = collectNodes(tree, 'mdxJsxTextElement')
    expect(citations).toHaveLength(0)
  })

  it('handles a paragraph with only a citation token', () => {
    const tree = parseWithCitations('{{5}}')
    const citations = collectNodes(tree, 'mdxJsxTextElement') as Array<{
      attributes: Array<{ value: { value: string } }>
    }>
    expect(citations).toHaveLength(1)
    expect(citations[0].attributes[0].value.value).toBe('5')
  })

  it('handles consecutive citations with no space', () => {
    const tree = parseWithCitations('{{1}}{{2}}')
    const citations = collectNodes(tree, 'mdxJsxTextElement')
    expect(citations).toHaveLength(2)
  })

  it('creates a numeric literal estree for each citation', () => {
    const tree = parseWithCitations('Check {{7}}.')
    const citations = collectNodes(tree, 'mdxJsxTextElement') as Array<{
      attributes: Array<{
        value: {
          data: {
            estree: {
              body: Array<{
                expression: { value: number }
              }>
            }
          }
        }
      }>
    }>
    const estree = citations[0].attributes[0].value.data.estree
    expect(estree.body[0].expression.value).toBe(7)
  })
})
