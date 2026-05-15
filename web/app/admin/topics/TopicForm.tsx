'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function TopicForm() {
  const [fields, setFields] = useState({ name: '', slug: '', description: '', displayOrder: '0' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function set(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })) }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, displayOrder: Number(fields.displayOrder) }),
    })
    setSaving(false)
    setFields({ name: '', slug: '', description: '', displayOrder: '0' })
    router.refresh()
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
            if (!fields.slug || fields.slug === autoSlug(fields.name)) {
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
      <Button size="sm" onClick={save} disabled={saving || !fields.name.trim() || !fields.slug.trim()}>
        {saving ? 'Saving…' : 'Add topic'}
      </Button>
    </div>
  )
}
