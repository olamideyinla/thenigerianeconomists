/**
 * remark-citations — transforms {{N}} tokens in prose text into
 * <Citation n={N} /> MDX JSX inline elements.
 *
 * Rules:
 *  - Only positive integers (N ≥ 1) are matched.
 *  - Tokens inside code / inlineCode nodes are never touched
 *    (the MDAST structure naturally protects them — `code` and
 *    `inlineCode` carry their content in `.value`, not as child
 *    `text` nodes, so our visitor never sees them).
 *  - Multiple tokens per paragraph are all replaced in one pass.
 *  - Malformed tokens ({{abc}}, {{0}}, {{-1}}) are left as plain text.
 */

import { visit, SKIP } from 'unist-util-visit'
import type { Root, Text, Parent } from 'mdast'
import type { Plugin } from 'unified'

// Matches {{N}} where N is one or more digits
const TOKEN_RE = /\{\{(\d+)\}\}/g

function numericLiteralEstree(n: number) {
  return {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: n, raw: String(n) },
      },
    ],
    sourceType: 'module',
    comments: [],
  }
}

function makeCitationNode(n: number) {
  return {
    type: 'mdxJsxTextElement',
    name: 'Citation',
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'n',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: String(n),
          data: { estree: numericLiteralEstree(n) },
        },
      },
    ],
    children: [],
  }
}

export const remarkCitations: Plugin<[], Root> = () => {
  return (tree) => {
    visit(
      tree,
      'text',
      (node: Text, index: number | null | undefined, parent: Parent | null | undefined) => {
        // Guard: must have a parent and a valid index
        if (!parent || index == null) return
        // Guard: skip text nodes whose parent is code-like
        // (belt-and-suspenders — see jsdoc note above)
        if (
          parent.type === 'code' ||
          parent.type === 'inlineCode'
        )
          return
        // Quick bailout if no candidate tokens
        if (!node.value.includes('{{')) return

        const text = node.value
        const parts: unknown[] = []
        let last = 0
        let hasValid = false

        TOKEN_RE.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = TOKEN_RE.exec(text)) !== null) {
          const n = parseInt(match[1], 10)
          // Only positive integers
          if (n < 1) continue

          hasValid = true

          // Preserve leading plain text
          if (match.index > last) {
            parts.push({ type: 'text', value: text.slice(last, match.index) })
          }

          parts.push(makeCitationNode(n))
          last = match.index + match[0].length
        }

        if (!hasValid) return

        // Trailing plain text
        if (last < text.length) {
          parts.push({ type: 'text', value: text.slice(last) })
        }

        // Replace the single text node with the expanded array
        ;(parent as any).children.splice(index, 1, ...parts)

        // Skip past all newly inserted nodes; unist-util-visit@5 tuple API
        return [SKIP, index + parts.length] as [typeof SKIP, number]
      }
    )
  }
}
