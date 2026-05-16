'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'

interface Disclosure {
  id: string
  text: string
  effectiveFrom: Date
  effectiveTo: Date | null
}

const SALUTATIONS = [
  '',
  'Dr.',
  'Prof.',
  'Mr.',
  'Mrs.',
  'Ms.',
  'Engr.',
  'Barr.',
  'Hon.',
  'Chief',
  'Amb.',
]

interface Author {
  id: string
  salutation: string | null
  name: string
  slug: string
  role: string
  affiliation: string | null
  bio: string | null
  email: string | null
  avatarUrl: string | null
  twitter: string | null
  linkedin: string | null
  isStaff: boolean
  disclosures: Disclosure[]
}

export function AuthorEditForm({ author }: { author: Author }) {
  const [fields, setFields] = useState({
    salutation: author.salutation ?? '',
    name: author.name,
    slug: author.slug,
    role: author.role,
    affiliation: author.affiliation ?? '',
    bio: author.bio ?? '',
    email: author.email ?? '',
    avatarUrl: author.avatarUrl ?? '',
    twitter: author.twitter ?? '',
    linkedin: author.linkedin ?? '',
    isStaff: author.isStaff,
  })
  const [, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [newDisclosure, setNewDisclosure] = useState('')

  function set(k: string, v: string | boolean) {
    setFields((f) => ({ ...f, [k]: v }))
  }

  async function save() {
    startTransition(async () => {
      await fetch(`/api/admin/authors/${author.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  async function addDisclosure() {
    if (!newDisclosure.trim()) return
    await fetch(`/api/admin/authors/${author.id}/disclosures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newDisclosure }),
    })
    setNewDisclosure('')
    window.location.reload()
  }

  async function endDisclosure(disclosureId: string) {
    await fetch(`/api/admin/authors/${author.id}/disclosures/${disclosureId}`, { method: 'DELETE' })
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="admin-card space-y-3">
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Profile
        </h2>
        <div className="admin-form-row">
          <div className="admin-form-field" style={{ maxWidth: 140, flexShrink: 0 }}>
            <label className="admin-form-label">Salutation</label>
            <select
              className="ref-field"
              value={fields.salutation}
              onChange={(e) => set('salutation', e.target.value)}
            >
              {SALUTATIONS.map((s) => (
                <option key={s} value={s}>{s || '— none —'}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-field">
            <label className="admin-form-label">Name</label>
            <input className="ref-field" value={fields.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="admin-form-field">
            <label className="admin-form-label">Slug</label>
            <input className="ref-field" value={fields.slug} onChange={(e) => set('slug', e.target.value)} />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label className="admin-form-label">Role / title</label>
            <input className="ref-field" value={fields.role} onChange={(e) => set('role', e.target.value)} />
          </div>
          <div className="admin-form-field">
            <label className="admin-form-label">Affiliation</label>
            <input className="ref-field" value={fields.affiliation} onChange={(e) => set('affiliation', e.target.value)} />
          </div>
        </div>
        <div className="admin-form-field">
          <label className="admin-form-label">Bio (markdown)</label>
          <textarea className="ref-field" rows={4} value={fields.bio} onChange={(e) => set('bio', e.target.value)} />
        </div>
        <div className="admin-form-field">
          <label className="admin-form-label">Contact email <span style={{ color: '#9ca3af', fontWeight: 400 }}>(for editorial notifications)</span></label>
          <input className="ref-field" type="email" value={fields.email} onChange={(e) => set('email', e.target.value)} placeholder="author@example.com" />
        </div>
        <div className="admin-form-field">
          <label className="admin-form-label">Avatar URL</label>
          <input className="ref-field" value={fields.avatarUrl} onChange={(e) => set('avatarUrl', e.target.value)} />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label className="admin-form-label">Twitter / X handle</label>
            <input className="ref-field" value={fields.twitter} onChange={(e) => set('twitter', e.target.value)} />
          </div>
          <div className="admin-form-field">
            <label className="admin-form-label">LinkedIn URL</label>
            <input className="ref-field" value={fields.linkedin} onChange={(e) => set('linkedin', e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={fields.isStaff} onChange={(e) => set('isStaff', e.target.checked)} />
          Staff author
        </label>
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={save}>Save profile</Button>
          {saved && <span className="text-xs text-green-600 self-center">Saved</span>}
        </div>
      </div>

      {/* COI Disclosures */}
      <div className="admin-card space-y-3">
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          COI Disclosures
        </h2>
        {author.disclosures.length === 0 && (
          <p className="text-sm text-gray-400">No disclosures on file.</p>
        )}
        {author.disclosures.map((d) => (
          <div key={d.id} className="ref-row">
            <div className="ref-row-head">
              <span className="text-xs text-gray-500">
                From {new Date(d.effectiveFrom).toLocaleDateString()}
                {d.effectiveTo ? ` to ${new Date(d.effectiveTo).toLocaleDateString()}` : ' (active)'}
              </span>
              {!d.effectiveTo && (
                <button
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => endDisclosure(d.id)}
                >
                  End disclosure
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700">{d.text}</p>
          </div>
        ))}
        <div className="admin-form-field">
          <label className="admin-form-label">Add new disclosure</label>
          <textarea
            className="ref-field"
            rows={2}
            value={newDisclosure}
            onChange={(e) => setNewDisclosure(e.target.value)}
            placeholder="Describe the conflict of interest…"
          />
        </div>
        <Button size="sm" variant="outline" onClick={addDisclosure}>Add disclosure</Button>
      </div>
    </div>
  )
}
