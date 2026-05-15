'use client'

// Rich text editor for the contributor submission form.
// Preserves tables and images pasted from Word, Google Docs, or directly.
// Images are stored as base64 (max 2 MB each) — the editorial team
// re-uploads figures properly before publication.

import { useEffect } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2 MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarBtn({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // prevent editor blur
        onClick()
      }}
      title={title}
      className={`re-tb-btn${active ? ' re-tb-btn--active' : ''}`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="re-tb-divider" aria-hidden />
}

function Toolbar({ editor }: { editor: Editor }) {
  const h2 = editor.isActive('heading', { level: 2 })
  const h3 = editor.isActive('heading', { level: 3 })

  return (
    <div className="re-toolbar" role="toolbar" aria-label="Formatting options">
      {/* Headings */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={h2}
        title="Heading 2"
      >
        H2
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={h3}
        title="Heading 3"
      >
        H3
      </ToolbarBtn>

      <Divider />

      {/* Inline */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarBtn>

      <Divider />

      {/* Lists */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet list"
      >
        &#8226; List
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered list"
      >
        1. List
      </ToolbarBtn>

      <Divider />

      {/* Block quote */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Block quote"
      >
        &#10077;&#10078;
      </ToolbarBtn>

      <Divider />

      {/* History */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        &#8592; Undo
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo (Ctrl+Y)"
      >
        Redo &#8594;
      </ToolbarBtn>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onChange: (html: string) => void
  placeholder?: string
}

export function RichArticleEditor({ onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      TableKit,
    ],
    editorProps: {
      attributes: {
        class: 'contribute-rich-body',
        'data-placeholder': placeholder ?? '',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Handle direct image paste (screenshots, dragged images) with size guard.
  // HTML paste from Word/Google Docs is handled automatically by Tiptap.
  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom

    const handlePaste = async (e: Event) => {
      const ce = e as ClipboardEvent
      const items = Array.from(ce.clipboardData?.items ?? [])
      const imageItem = items.find(i => i.type.startsWith('image/'))
      if (!imageItem) return // not an image-only paste — let Tiptap handle it

      ce.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return

      if (file.size > MAX_IMAGE_BYTES) {
        alert(
          `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
          `Please compress it below 2 MB before pasting.`
        )
        return
      }

      const src = await fileToBase64(file)
      editor.chain().focus().setImage({ src }).run()
    }

    dom.addEventListener('paste', handlePaste)
    return () => dom.removeEventListener('paste', handlePaste)
  }, [editor])

  return (
    <div className="contribute-rich-wrap">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
