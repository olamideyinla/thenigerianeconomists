/**
 * remark-directives — transforms remark-directive AST nodes into
 * MDX JSX flow elements.
 *
 * Supported directives (must run AFTER remark-directive has parsed them):
 *
 *   :::pullquote
 *   text
 *   :::
 *   → <Pullquote>text</Pullquote>
 *
 *   :::rebutted
 *   paragraph
 *   :::
 *   → <RebuttedParagraph>text</RebuttedParagraph>
 *
 *   :::dropcap
 *   first paragraph
 *   :::
 *   → <Dropcap>text</Dropcap>
 *
 *   :::figure{id="fig-nafem-table-01"}:::
 *   → <Figure id="fig-nafem-table-01" />
 *
 *   Also handles leafDirective for figure: ::figure{id="..."}.
 *
 * For pullquote / dropcap / rebutted, the paragraph wrapper is stripped so
 * the component receives raw inline content (text nodes, Citation elements,
 * etc.) rather than a nested <p>.
 */

import { visit, SKIP } from 'unist-util-visit'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'

function makeJsxStringAttr(name: string, value: string) {
  return { type: 'mdxJsxAttribute', name, value }
}

/**
 * Flatten the direct children of a containerDirective for prose directives
 * (pullquote, dropcap, rebutted). If the directive contains a single paragraph,
 * we unwrap it so the component receives the inline nodes directly (no extra <p>).
 */
function flattenChildren(children: unknown[]): unknown[] {
  if (children.length === 1) {
    const child = children[0] as { type: string; children?: unknown[] }
    if (child.type === 'paragraph' && child.children) {
      return child.children
    }
  }
  return children
}

export const remarkDirectives: Plugin<[], Root> = () => {
  return (tree) => {
    visit(
      tree,
      (node: unknown, index: number | null | undefined, parent: unknown) => {
        const n = node as {
          type: string
          name?: string
          attributes?: Record<string, string>
          children?: unknown[]
        }
        const p = parent as { children: unknown[] } | null

        if (
          n.type !== 'containerDirective' &&
          n.type !== 'leafDirective'
        )
          return
        if (index == null || p === null) return

        const name = n.name ?? ''
        const attrs = n.attributes ?? {}
        const children: unknown[] = n.children ?? []

        switch (name) {
          case 'pullquote': {
            p.children.splice(index, 1, {
              type: 'mdxJsxFlowElement',
              name: 'Pullquote',
              attributes: [],
              children: flattenChildren(children),
            })
            return [SKIP, index] as [typeof SKIP, number]
          }

          case 'rebutted': {
            p.children.splice(index, 1, {
              type: 'mdxJsxFlowElement',
              name: 'RebuttedParagraph',
              attributes: [],
              children: flattenChildren(children),
            })
            return [SKIP, index] as [typeof SKIP, number]
          }

          case 'dropcap': {
            p.children.splice(index, 1, {
              type: 'mdxJsxFlowElement',
              name: 'Dropcap',
              attributes: [],
              children: flattenChildren(children),
            })
            return [SKIP, index] as [typeof SKIP, number]
          }

          case 'figure': {
            const id = attrs.id
            if (!id) {
              // No id — replace with nothing (graceful skip)
              p.children.splice(index, 1)
              return [SKIP, index] as [typeof SKIP, number]
            }
            p.children.splice(index, 1, {
              type: 'mdxJsxFlowElement',
              name: 'Figure',
              attributes: [makeJsxStringAttr('id', id)],
              children: [],
            })
            return [SKIP, index] as [typeof SKIP, number]
          }
        }
      }
    )
  }
}
