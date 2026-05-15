'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Article {
  id: string
  headline: string | null
}

export function CorrectionForm({ articles }: { articles: Article[] }) {
  const [fields, setFields] = useState({ articleId: '', body: '', severity: 'CLARIFICATION' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function set(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })) }

  async function save() {
    if (!fields.articleId || !fields.body.trim()) return
    setSaving(true)
    await fetch('/api/admin/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    setSaving(false)
    setFields({ articleId: '', body: '', severity: 'CLARIFICATION' })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="admin-form-field">
        <label className="admin-form-label">Article</label>
        <select className="ref-field" value={fields.articleId} onChange={(e) => set('articleId', e.target.value)}>
          <option value="">— select article —</option>
          {articles.map((a) => <option key={a.id} value={a.id}>{a.headline ?? 'Untitled'}</option>)}
        </select>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Severity</label>
        <select className="ref-field" value={fields.severity} onChange={(e) => set('severity', e.target.value)}>
          <option value="TYPO">Typo</option>
          <option value="CLARIFICATION">Clarification</option>
          <option value="FACTUAL">Factual error</option>
          <option value="SIGNIFICANT">Significant</option>
        </select>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Correction text</label>
        <textarea className="ref-field" rows={4} value={fields.body} onChange={(e) => set('body', e.target.value)} placeholder="Describe what was corrected…" />
      </div>
      <Button size="sm" onClick={save} disabled={saving || !fields.articleId || !fields.body.trim()}>
        {saving ? 'Saving…' : 'Issue correction'}
      </Button>
    </div>
  )
}
