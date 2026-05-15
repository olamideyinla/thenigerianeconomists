'use client'

import { useState, useRef, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface SynthesisEditorProps {
  synthesis: {
    id: string
    title: string
    slug: string
    issueNumber: number
    weekOf: Date
    contentMdx: string
    publishedAt: Date | null
    editorId: string
    articles: Array<{
      order: number
      article: {
        id: string
        headline: string | null
        slug: string
        author: { name: string }
      }
    }>
  }
  authors: Array<{ id: string; name: string }>
  subscriberCount: number
}

export function SynthesisEditor({ synthesis, authors, subscriberCount }: SynthesisEditorProps) {
  const [contentMdx, setContentMdx] = useState(synthesis.contentMdx)
  const [title, setTitle] = useState(synthesis.title)
  const [editorId, setEditorId] = useState(synthesis.editorId)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [, startTransition] = useTransition()
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/synthesis/${synthesis.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, contentMdx, editorId }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function publish() {
    if (!confirm('Publish this Synthesis issue?')) return
    await fetch(`/api/admin/synthesis/${synthesis.id}/publish`, { method: 'POST' })
    window.location.reload()
  }

  function scheduleAutoSave(mdx: string) {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      startTransition(async () => {
        await fetch(`/api/admin/synthesis/${synthesis.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentMdx: mdx }),
        })
      })
    }, 30_000)
  }

  return (
    <div className="article-editor-shell" style={{ height: '100vh' }}>
      {/* Monaco pane */}
      <div className="article-editor-pane">
        <div className="article-editor-toolbar">
          <input
            className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Synthesis title…"
          />
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1"
            value={editorId}
            onChange={(e) => setEditorId(e.target.value)}
          >
            {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {saved && <span className="text-xs text-green-600">Saved</span>}
          <Button size="sm" variant="outline" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {!synthesis.publishedAt && (
            <Button size="sm" onClick={publish}>Publish</Button>
          )}
        </div>

        <div className="article-editor-monaco">
          <MonacoEditor
            language="markdown"
            value={contentMdx}
            onChange={(v) => { setContentMdx(v ?? ''); scheduleAutoSave(v ?? '') }}
            options={{ wordWrap: 'on', lineNumbers: 'on', minimap: { enabled: false }, fontSize: 14 }}
            height="100%"
          />
        </div>
      </div>

      {/* Article linker + newsletter sidebar */}
      <div className="editor-panels" style={{ width: 300 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Linked articles</p>
        </div>
        <div className="editor-panel-content">
          {synthesis.articles.length === 0 ? (
            <p className="text-sm text-gray-400">No articles linked yet.</p>
          ) : (
            <div className="space-y-2">
              {synthesis.articles.map((sa) => (
                <div key={sa.article.id} className="ref-row">
                  <p className="text-xs font-medium">{sa.article.headline}</p>
                  <p className="text-xs text-gray-500">{sa.article.author.name}</p>
                </div>
              ))}
            </div>
          )}
          <ArticleLinker synthesisId={synthesis.id} />
        </div>

        {/* Newsletter send — only visible once published */}
        {synthesis.publishedAt && (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', marginTop: 16 }}>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Newsletter</p>
            </div>
            <div className="editor-panel-content">
              <NewsletterSendPanel
                synthesisId={synthesis.id}
                subscriberCount={subscriberCount}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ArticleLinker({ synthesisId }: { synthesisId: string }) {
  const [slug, setSlug] = useState('')
  const [msg, setMsg] = useState('')

  async function link() {
    if (!slug.trim()) return
    const res = await fetch(`/api/admin/synthesis/${synthesisId}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (res.ok) {
      setMsg('Linked!')
      setSlug('')
      window.location.reload()
    } else {
      const e = await res.json()
      setMsg(e.error ?? 'Error')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-gray-600">Link article by slug</p>
      <input
        className="ref-field"
        placeholder="article-slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <Button size="sm" variant="outline" onClick={link}>Link</Button>
      {msg && <p className="text-xs text-green-600">{msg}</p>}
    </div>
  )
}

type SendState = 'idle' | 'previewing' | 'sending' | 'done' | 'error'

function NewsletterSendPanel({ synthesisId, subscriberCount }: { synthesisId: string; subscriberCount: number }) {
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly')
  const [state, setState] = useState<SendState>('idle')
  const [result, setResult] = useState<{ sent?: number; suppressed?: number; sentTo?: string } | null>(null)
  const [error, setError] = useState('')

  async function sendPreview() {
    setState('previewing')
    setError('')
    try {
      const res = await fetch('/api/admin/newsletter/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synthesisId, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Preview failed')
      setResult({ sentTo: data.sentTo })
      setState('done')
    } catch (e) {
      setError((e as Error).message)
      setState('error')
    }
  }

  async function sendToAll() {
    if (!confirm(`Send this ${type} newsletter to ${subscriberCount} confirmed subscriber${subscriberCount !== 1 ? 's' : ''}?`)) return
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synthesisId, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Send failed')
      setResult({ sent: data.sent, suppressed: data.suppressed })
      setState('done')
    } catch (e) {
      setError((e as Error).message)
      setState('error')
    }
  }

  function reset() {
    setState('idle')
    setResult(null)
    setError('')
  }

  if (state === 'done' && result) {
    return (
      <div className="space-y-3">
        <div className="text-xs bg-green-50 border border-green-200 rounded p-3">
          {result.sentTo ? (
            <p className="text-green-700">Preview sent to <strong>{result.sentTo}</strong></p>
          ) : (
            <p className="text-green-700">
              Sent to <strong>{result.sent}</strong> subscriber{result.sent !== 1 ? 's' : ''}.
              {(result.suppressed ?? 0) > 0 && ` ${result.suppressed} suppressed.`}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={reset} className="w-full">Send another</Button>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        <Button size="sm" variant="outline" onClick={reset} className="w-full">Try again</Button>
      </div>
    )
  }

  const busy = state === 'previewing' || state === 'sending'

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-gray-500 mb-1.5">{subscriberCount} confirmed subscriber{subscriberCount !== 1 ? 's' : ''}</p>
        <select
          className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
          value={type}
          onChange={(e) => setType(e.target.value as 'weekly' | 'monthly')}
        >
          <option value="weekly">Weekly digest</option>
          <option value="monthly">Monthly review</option>
        </select>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={sendPreview}
        disabled={busy}
        className="w-full"
      >
        {state === 'previewing' ? 'Sending preview…' : 'Send preview to me'}
      </Button>
      <Button
        size="sm"
        onClick={sendToAll}
        disabled={busy || subscriberCount === 0}
        className="w-full"
      >
        {state === 'sending' ? 'Sending…' : `Send to ${subscriberCount} subscriber${subscriberCount !== 1 ? 's' : ''}`}
      </Button>
    </div>
  )
}
