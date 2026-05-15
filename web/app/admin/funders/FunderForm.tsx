'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function FunderForm() {
  const [fields, setFields] = useState({
    name: '',
    type: 'FOUNDATION',
    amountRange: '',
    periodStart: '',
    periodEnd: '',
    description: '',
    url: '',
    displayOrder: '0',
    isCurrent: true,
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function set(k: string, v: string | boolean) { setFields((f) => ({ ...f, [k]: v })) }

  async function save() {
    if (!fields.name.trim() || !fields.periodStart) return
    setSaving(true)
    await fetch('/api/admin/funders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...fields,
        displayOrder: Number(fields.displayOrder),
        periodStart: new Date(fields.periodStart).toISOString(),
        periodEnd: fields.periodEnd ? new Date(fields.periodEnd).toISOString() : null,
      }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="admin-form-field">
        <label className="admin-form-label">Name</label>
        <input className="ref-field" value={fields.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Type</label>
        <select className="ref-field" value={fields.type} onChange={(e) => set('type', e.target.value)}>
          <option value="FOUNDATION">Foundation</option>
          <option value="INSTITUTION">Institution</option>
          <option value="INDIVIDUAL">Individual</option>
          <option value="READER_REVENUE">Reader revenue</option>
        </select>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Amount range</label>
        <input className="ref-field" value={fields.amountRange} onChange={(e) => set('amountRange', e.target.value)} placeholder="e.g. $10,000–$50,000" />
      </div>
      <div className="admin-form-row">
        <div className="admin-form-field">
          <label className="admin-form-label">Period start</label>
          <input className="ref-field" type="month" value={fields.periodStart} onChange={(e) => set('periodStart', e.target.value)} />
        </div>
        <div className="admin-form-field">
          <label className="admin-form-label">Period end</label>
          <input className="ref-field" type="month" value={fields.periodEnd} onChange={(e) => set('periodEnd', e.target.value)} />
        </div>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Description</label>
        <textarea className="ref-field" rows={2} value={fields.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Website URL</label>
        <input className="ref-field" type="url" value={fields.url} onChange={(e) => set('url', e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={fields.isCurrent} onChange={(e) => set('isCurrent', e.target.checked)} />
        Currently active
      </label>
      <Button size="sm" onClick={save} disabled={saving || !fields.name.trim()}>
        {saving ? 'Saving…' : 'Add funder'}
      </Button>
    </div>
  )
}
