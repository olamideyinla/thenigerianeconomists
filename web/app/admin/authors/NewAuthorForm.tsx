'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const EMPTY = {
  name: '', slug: '', initials: '', role: '', affiliation: '',
  bio: '', avatarUrl: '', twitter: '', linkedin: '', isStaff: false,
}

export function NewAuthorForm({ onCancel }: { onCancel: () => void }) {
  const [fields, setFields] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function set(k: string, v: string | boolean) {
    setFields((f) => ({ ...f, [k]: v }))
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function autoInitials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 3)
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, isStaff: fields.isStaff }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create author')
        return
      }
      onCancel()
      router.refresh()
    } catch {
      setError('Unexpected error')
    } finally {
      setSaving(false)
    }
  }

  const can = fields.name.trim() && fields.slug.trim() && fields.initials.trim() && fields.role.trim()

  return (
    <div className="admin-table-wrap p-6 space-y-4 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-700">New author</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="admin-form-field col-span-2">
          <label className="admin-form-label">Full name *</label>
          <input
            className="ref-field"
            value={fields.name}
            onChange={(e) => {
              set('name', e.target.value)
              if (!fields.slug || fields.slug === autoSlug(fields.name))
                set('slug', autoSlug(e.target.value))
              if (!fields.initials || fields.initials === autoInitials(fields.name))
                set('initials', autoInitials(e.target.value))
            }}
            placeholder="Chidi Okeke"
          />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Slug *</label>
          <input
            className="ref-field font-mono text-xs"
            value={fields.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="chidi-okeke"
          />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Initials *</label>
          <input
            className="ref-field"
            value={fields.initials}
            onChange={(e) => set('initials', e.target.value.toUpperCase().slice(0, 3))}
            placeholder="CO"
            maxLength={3}
          />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Title / role *</label>
          <input
            className="ref-field"
            value={fields.role}
            onChange={(e) => set('role', e.target.value)}
            placeholder="Economics Correspondent"
          />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Affiliation</label>
          <input
            className="ref-field"
            value={fields.affiliation}
            onChange={(e) => set('affiliation', e.target.value)}
            placeholder="University of Lagos"
          />
        </div>
      </div>

      <div className="admin-form-field">
        <label className="admin-form-label">Bio (markdown)</label>
        <textarea
          className="ref-field"
          rows={3}
          value={fields.bio}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="Short biography shown on the author page."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="admin-form-field">
          <label className="admin-form-label">X / Twitter handle</label>
          <input
            className="ref-field"
            value={fields.twitter}
            onChange={(e) => set('twitter', e.target.value)}
            placeholder="@chidiokeke"
          />
        </div>
        <div className="admin-form-field">
          <label className="admin-form-label">LinkedIn URL</label>
          <input
            className="ref-field"
            value={fields.linkedin}
            onChange={(e) => set('linkedin', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isStaff"
          type="checkbox"
          checked={fields.isStaff}
          onChange={(e) => set('isStaff', e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="isStaff" className="text-sm text-gray-700">Staff author</label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving || !can}>
          {saving ? 'Creating…' : 'Create author'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
