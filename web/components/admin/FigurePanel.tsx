'use client'

import { useState } from 'react'
import { createFigure, deleteFigure } from '@/app/admin/(protected)/articles/[id]/actions'
import { FigureEditorDialog } from './FigureEditorDialog'

interface FigureRow {
  id: string
  kind: string
  position: number
  altText: string | null
  caption: string
  source: string
  width: string
}

interface FigurePanelProps {
  articleId: string
  initialFigures: FigureRow[]
  onInsertFigure: (figId: string) => void
}

const KIND_LABELS: Record<string, string> = {
  IMAGE: 'Image',
  CHART_NATIVE: 'Chart',
  CHART_EMBED: 'Embed',
  TABLE: 'Table',
  MAP: 'Map',
}

export function FigurePanel({ articleId, initialFigures, onInsertFigure }: FigurePanelProps) {
  const [figures, setFigures] = useState<FigureRow[]>(initialFigures)
  const [selected, setSelected] = useState<FigureRow | null>(null)
  const [showKindPicker, setShowKindPicker] = useState(false)

  async function handleAdd(kind: string) {
    setShowKindPicker(false)
    const fig = await createFigure(articleId, kind)
    setFigures((fs) => [...fs, fig as FigureRow])
  }

  async function handleDelete(id: string) {
    await deleteFigure(id)
    setFigures((fs) => fs.filter((f) => f.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{figures.length} figure{figures.length !== 1 ? 's' : ''}</span>
        <div className="relative">
          <button className="admin-add-btn" onClick={() => setShowKindPicker((v) => !v)}>
            + Add figure
          </button>
          {showKindPicker && (
            <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 w-40">
              {Object.entries(KIND_LABELS).map(([kind, label]) => (
                <button
                  key={kind}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => handleAdd(kind)}
                >
                  {label}
                </button>
              ))}
              <button
                className="w-full text-left px-3 py-2 text-xs text-gray-400 border-t"
                onClick={() => setShowKindPicker(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {figures.map((fig) => (
        <div key={fig.id} className="figure-row" onClick={() => setSelected(fig)}>
          <span className="figure-row-kind">{KIND_LABELS[fig.kind] ?? fig.kind}</span>
          <span className="figure-row-id">{fig.id}</span>
          <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              title="Insert in MDX"
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => onInsertFigure(fig.id)}
            >
              Insert
            </button>
            <button
              title="Delete figure"
              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
              onClick={() => handleDelete(fig.id)}
            >
              &#x2715;
            </button>
          </div>
        </div>
      ))}

      {figures.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No figures yet.</p>
      )}

      {selected && (
        <FigureEditorDialog
          figure={selected}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            setFigures((fs) => fs.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)))
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
