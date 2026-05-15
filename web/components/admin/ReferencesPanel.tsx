'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { createReference, updateReference, deleteReference } from '@/app/admin/(protected)/articles/[id]/actions'

interface Ref {
  id: string
  indexNumber: number
  author: string
  year: string
  title: string
  publication: string | null
  url: string | null
  notes: string | null
}

interface ReferencesPanelProps {
  articleId: string
  initialRefs: Ref[]
  onInsertCitation: (n: number) => void
}

export function ReferencesPanel({ articleId, initialRefs, onInsertCitation }: ReferencesPanelProps) {
  const [refs, setRefs] = useState<Ref[]>(initialRefs)
  const [, startTransition] = useTransition()

  async function handleAdd() {
    const ref = await createReference(articleId, {
      author: '',
      year: new Date().getFullYear().toString(),
      title: '',
    })
    setRefs((r) => [...r, ref as Ref])
  }

  function handleChange(id: string, field: string, value: string) {
    setRefs((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  async function handleBlur(ref: Ref) {
    startTransition(async () => {
      await updateReference(ref.id, {
        author: ref.author,
        year: ref.year,
        title: ref.title,
        publication: ref.publication ?? undefined,
        url: ref.url ?? undefined,
        notes: ref.notes ?? undefined,
      })
    })
  }

  async function handleDelete(id: string) {
    await deleteReference(id)
    setRefs((rs) => {
      const next = rs.filter((r) => r.id !== id)
      return next.map((r, i) => ({ ...r, indexNumber: i + 1 }))
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{refs.length} reference{refs.length !== 1 ? 's' : ''}</span>
        <button className="admin-add-btn" onClick={handleAdd}>+ Add</button>
      </div>

      {refs.map((ref) => (
        <div key={ref.id} className="ref-row">
          <div className="ref-row-head">
            <span className="ref-num">#{ref.indexNumber}</span>
            <div className="flex gap-1">
              <button
                title="Insert citation at cursor"
                className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => onInsertCitation(ref.indexNumber)}
              >
                Insert &#123;&#123;{ref.indexNumber}&#125;&#125;
              </button>
              <button
                title="Delete reference"
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => handleDelete(ref.id)}
              >
                &#x2715;
              </button>
            </div>
          </div>
          <input
            className="ref-field"
            placeholder="Author(s)"
            value={ref.author}
            onChange={(e) => handleChange(ref.id, 'author', e.target.value)}
            onBlur={() => handleBlur(ref)}
          />
          <input
            className="ref-field"
            placeholder="Year"
            value={ref.year}
            onChange={(e) => handleChange(ref.id, 'year', e.target.value)}
            onBlur={() => handleBlur(ref)}
          />
          <input
            className="ref-field"
            placeholder="Title"
            value={ref.title}
            onChange={(e) => handleChange(ref.id, 'title', e.target.value)}
            onBlur={() => handleBlur(ref)}
          />
          <input
            className="ref-field"
            placeholder="Publication / Journal"
            value={ref.publication ?? ''}
            onChange={(e) => handleChange(ref.id, 'publication', e.target.value)}
            onBlur={() => handleBlur(ref)}
          />
          <input
            className="ref-field"
            placeholder="URL (optional)"
            value={ref.url ?? ''}
            onChange={(e) => handleChange(ref.id, 'url', e.target.value)}
            onBlur={() => handleBlur(ref)}
          />
          <textarea
            className="ref-field"
            placeholder="Notes (optional)"
            rows={2}
            value={ref.notes ?? ''}
            onChange={(e) => handleChange(ref.id, 'notes', e.target.value)}
            onBlur={() => handleBlur(ref)}
          />
        </div>
      ))}

      {refs.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No references yet. Add at least 5 to publish.</p>
      )}
    </div>
  )
}
