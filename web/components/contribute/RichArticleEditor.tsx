'use client'

// Rich text editor for the contributor submission form.
// Preserves tables and images pasted from Word, Google Docs, or directly.
// Images are stored as base64 (max 2 MB each) — the editorial team
// re-uploads figures properly before publication.

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
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
      <EditorContent editor={editor} />
    </div>
  )
}
