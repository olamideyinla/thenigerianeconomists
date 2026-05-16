'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Topic {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
}

interface TopicFormProps {
  editing?: Topic | null
  onCancel?: () => void
  onSaved?: () => void
}

export function TopicForm({ editing, onCancel, onSaved }: TopicFormProps) {
  const [fields, setFields] = useState({
    name: editing?.name ?? '',
    slug: editing?.slug ?? '',
    description: editing?.description ?? '',
    displayOrder: String(editing?.displayOrder ?? 0),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })) }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function save() {
    setSaving(true)
    setError(null)
    const payload = { ...fields, displayOrder: Number(fields.displayOrder) }
    let res: Response
    if (editing) {
      res = await fetch(`/api/admin/topics/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    setSaving(false)
    if (!res.ok) {
      setError('Failed to save. Please try again.')
      return
    }
    if (!editing) setFields({ name: '', slug: '', description: '', displayOrder: '0' })
    onSaved?.()
  }

  return (
    <div className="space-y-3">
      <div className="admin-form-field">
        <label className="admin-form-label">Name</label>
        <input
          className="ref-field"
          value={fields.name}
          onChange={(e) => {
            set('name', e.target.value)
            if (!editing && (!fields.slug || fields.slug === autoSlug(fields.name))) {
              set('slug', autoSlug(e.target.value))
            }
          }}
        />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Slug</label>
        <input className="ref-field" value={fields.slug} onChange={(e) => set('slug', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Description</label>
        <textarea className="ref-field" rows={2} value={fields.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Display order</label>
        <input className="ref-field" type="number" value={fields.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} />
      </div>
      {error && <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" onClick={save} disabled={saving || !fields.name.trim() || !fields.slug.trim()}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add topic'}
        </Button>
        {editing && onCancel && (
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </div>
  )
}
