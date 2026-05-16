'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  function set(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })) }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function save() {
    setSaving(true)
    const payload = { ...fields, displayOrder: Number(fields.displayOrder) }
    if (editing) {
      await fetch(`/api/admin/topics/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setFields({ name: '', slug: '', description: '', displayOrder: '0' })
    }
    setSaving(false)
    router.refresh()
    onSaved?.()
    onCancel?.()
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
