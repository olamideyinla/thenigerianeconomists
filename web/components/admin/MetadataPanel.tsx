'use client'

import { useState, useTransition, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { saveArticleDraft } from '@/app/admin/(protected)/articles/[id]/actions'

interface MetadataPanelProps {
  article: {
    id: string
    slug: string | null
    headline: string | null
    deck: string | null
    kicker: string | null
    excerpt: string | null
    readMinutes: number
    wordCount: number
    authorId: string
    topicId: string
    scheduledFor: Date | null
  }
  authors: Array<{ id: string; name: string }>
  topics: Array<{ id: string; name: string }>
}

export interface MetadataPanelHandle {
  getFields: () => {
    slug: string
    headline: string
    deck: string
    kicker: string
    excerpt: string
    readMinutes: number
    wordCount: number
    authorId: string
    topicId: string
    scheduledFor: string
  }
}

export const MetadataPanel = forwardRef<MetadataPanelHandle, MetadataPanelProps>(
function MetadataPanel({ article, authors, topics }, ref) {
  const [fields, setFields] = useState({
    slug: article.slug ?? '',
    headline: article.headline ?? '',
    deck: article.deck ?? '',
    kicker: article.kicker ?? '',
    excerpt: article.excerpt ?? '',
    readMinutes: article.readMinutes,
    wordCount: article.wordCount,
    authorId: article.authorId,
    topicId: article.topicId,
    scheduledFor: article.scheduledFor
      ? new Date(article.scheduledFor).toISOString().slice(0, 16)
      : '',
  })
  const [, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useImperativeHandle(ref, () => ({
    getFields: () => ({ ...fields }),
  }))

  function set(key: string, value: string | number) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  function save() {
    setError('')
    startTransition(async () => {
      try {
        await saveArticleDraft(article.id, {
          slug: fields.slug,
          headline: fields.headline,
          deck: fields.deck,
          kicker: fields.kicker,
          excerpt: fields.excerpt,
          readMinutes: Number(fields.readMinutes),
          wordCount: Number(fields.wordCount),
          authorId: fields.authorId,
          topicId: fields.topicId,
          scheduledFor: fields.scheduledFor || null,
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch {
        setError('Save failed. Please try again.')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="admin-form-field">
        <label className="admin-form-label">Headline</label>
        <input className="ref-field" value={fields.headline} onChange={(e) => set('headline', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Deck</label>
        <textarea className="ref-field" rows={2} value={fields.deck} onChange={(e) => set('deck', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Kicker</label>
        <input className="ref-field" value={fields.kicker} onChange={(e) => set('kicker', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Slug</label>
        <input className="ref-field" value={fields.slug} onChange={(e) => set('slug', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Excerpt</label>
        <textarea className="ref-field" rows={2} value={fields.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
      </div>
      <div className="admin-form-row">
        <div className="admin-form-field">
          <label className="admin-form-label">Read minutes</label>
          <input className="ref-field" type="number" min={1} value={fields.readMinutes} onChange={(e) => set('readMinutes', e.target.value)} />
        </div>
        <div className="admin-form-field">
          <label className="admin-form-label">Word count</label>
          <input className="ref-field" type="number" min={0} value={fields.wordCount} onChange={(e) => set('wordCount', e.target.value)} />
        </div>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Author</label>
        <select className="ref-field" value={fields.authorId} onChange={(e) => set('authorId', e.target.value)}>
          <option value="">— select author —</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Topic</label>
        <select className="ref-field" value={fields.topicId} onChange={(e) => set('topicId', e.target.value)}>
          <option value="">— select topic —</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Scheduled for</label>
        <input
          className="ref-field"
          type="datetime-local"
          value={fields.scheduledFor}
          onChange={(e) => set('scheduledFor', e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={save}>Save metadata</Button>
        {saved && <span className="text-xs text-green-600">Saved</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  )
})
