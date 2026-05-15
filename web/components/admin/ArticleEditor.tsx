'use client'

import { useState, useRef, useCallback, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReferencesPanel } from './ReferencesPanel'
import { FigurePanel } from './FigurePanel'
import { MetadataPanel } from './MetadataPanel'
import {
  saveArticleDraft,
  publishArticle,
  validateArticle,
  fixArticleMdx,
} from '@/app/admin/(protected)/articles/[id]/actions'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type ActivePanel = 'metadata' | 'references' | 'figures' | 'rebuttal'

interface ArticleEditorProps {
  article: {
    id: string
    slug: string | null
    headline: string | null
    deck: string | null
    kicker: string | null
    excerpt: string | null
    contentMdx: string
    status: string
    readMinutes: number
    wordCount: number
    authorId: string
    topicId: string
    scheduledFor: Date | null
    references: Array<{
      id: string
      indexNumber: number
      author: string
      year: string
      title: string
      publication: string | null
      url: string | null
      notes: string | null
    }>
    figures: Array<{
      id: string
      kind: string
      position: number
      altText: string | null
      caption: string
      source: string
      width: string
    }>
    author: { id: string; name: string }
    topic: { id: string; name: string }
  }
  authors: Array<{ id: string; name: string }>
  topics: Array<{ id: string; name: string }>
}

export function ArticleEditor({ article, authors, topics }: ArticleEditorProps) {
  const [contentMdx, setContentMdx] = useState(article.contentMdx)
  const [activePanel, setActivePanel] = useState<ActivePanel>('metadata')
  const [previewKey, setPreviewKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidation, setShowValidation] = useState(false)
  const [, startTransition] = useTransition()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleAutoSave = useCallback(
    (mdx: string) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        startTransition(async () => {
          await saveArticleDraft(article.id, { contentMdx: mdx })
        })
      }, 30_000)
    },
    [article.id],
  )

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    try {
      await saveArticleDraft(article.id, { contentMdx })
      setPreviewKey((k) => k + 1)
      setSaveMsg('Saved')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 2000)
    }
  }

  async function handlePublish() {
    const { errors } = await validateArticle(article.id)
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidation(true)
      return
    }
    await publishArticle(article.id)
    setSaveMsg('Published!')
  }

  async function handleValidate() {
    const { errors } = await validateArticle(article.id)
    setValidationErrors(errors)
    setShowValidation(true)
  }

  async function handleFixHtml() {
    setSaving(true)
    setSaveMsg('')
    try {
      const { contentMdx: fixed } = await fixArticleMdx(article.id)
      setContentMdx(fixed)
      // Push the fixed content into Monaco without losing cursor
      editorRef.current?.setValue(fixed)
      setPreviewKey((k) => k + 1)
      setSaveMsg('HTML fixed')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  function insertAtCursor(text: string) {
    const ed = editorRef.current
    if (!ed) return
    const sel = ed.getSelection()
    if (!sel) return
    ed.executeEdits('insert', [{ range: sel, text, forceMoveMarkers: true }])
    ed.focus()
  }

  function handleInsertCitation(n: number) {
    insertAtCursor(`{{${n}}}`)
  }

  function handleInsertFigure(figId: string) {
    insertAtCursor(`<Figure id="${figId}" />`)
  }

  const statusColor: Record<string, string> = {
    DRAFT: 'secondary',
    IN_REVIEW: 'outline',
    SCHEDULED: 'outline',
    PUBLISHED: 'default',
    RETRACTED: 'destructive',
  }

  return (
    <div className="article-editor-shell" style={{ height: '100vh' }}>
      {/* ── Left: Monaco editor ──────────────────────────────── */}
      <div className="article-editor-pane">
        {/* Toolbar */}
        <div className="article-editor-toolbar">
          <Badge variant={(statusColor[article.status] as 'default' | 'secondary' | 'outline' | 'destructive') ?? 'secondary'}>
            {article.status}
          </Badge>
          <span className="text-sm font-medium text-gray-700 flex-1 truncate ml-2">
            {article.headline ?? 'Untitled article'}
          </span>
          {saveMsg && <span className="text-xs text-green-600 font-medium">{saveMsg}</span>}
          <Button size="sm" variant="outline" onClick={handleFixHtml} disabled={saving} title="Convert any raw HTML in the content to clean MDX (fixes preview errors)">
            Fix HTML
          </Button>
          <Button size="sm" variant="outline" onClick={handleValidate}>
            Validate
          </Button>
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {article.status !== 'PUBLISHED' && (
            <Button size="sm" onClick={handlePublish}>
              Publish
            </Button>
          )}
        </div>

        {/* Validation errors */}
        {showValidation && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                {validationErrors.length === 0 ? (
                  <p className="text-sm text-green-700 font-medium">All checks passed.</p>
                ) : (
                  <ul className="space-y-1">
                    {validationErrors.map((e, i) => (
                      <li key={i} className="text-xs text-red-700">&#x2022; {e}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button className="text-xs text-gray-400 ml-4" onClick={() => setShowValidation(false)}>
                &#x2715;
              </button>
            </div>
          </div>
        )}

        {/* Monaco */}
        <div className="article-editor-monaco">
          <MonacoEditor
            language="markdown"
            value={contentMdx}
            onChange={(val) => {
              setContentMdx(val ?? '')
              scheduleAutoSave(val ?? '')
            }}
            onMount={(editor) => {
              editorRef.current = editor
            }}
            options={{
              wordWrap: 'on',
              lineNumbers: 'on',
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              fontFamily: "'Geist Mono', 'Fira Code', monospace",
            }}
            height="100%"
          />
        </div>
      </div>

      {/* ── Right: panels + preview ──────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '45%', flexShrink: 0 }}>
        {/* Panel tabs */}
        <div className="editor-panels" style={{ width: '100%', height: '60%' }}>
          <div className="editor-panel-tabs">
            {(['metadata', 'references', 'figures', 'rebuttal'] as ActivePanel[]).map((p) => (
              <button
                key={p}
                className={`editor-panel-tab${activePanel === p ? ' editor-panel-tab--active' : ''}`}
                onClick={() => setActivePanel(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="editor-panel-content">
            {activePanel === 'metadata' && (
              <MetadataPanel
                article={article}
                authors={authors}
                topics={topics}
              />
            )}
            {activePanel === 'references' && (
              <ReferencesPanel
                articleId={article.id}
                initialRefs={article.references}
                onInsertCitation={handleInsertCitation}
              />
            )}
            {activePanel === 'figures' && (
              <FigurePanel
                articleId={article.id}
                initialFigures={article.figures}
                onInsertFigure={handleInsertFigure}
              />
            )}
            {activePanel === 'rebuttal' && (
              <RebuttalPanelPlaceholder articleId={article.id} />
            )}
          </div>
        </div>

        {/* Preview iframe */}
        <div className="article-preview-pane" style={{ height: '40%', width: '100%' }}>
          <div className="article-preview-bar">
            <span>Preview</span>
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setPreviewKey((k) => k + 1)}
            >
              Refresh
            </button>
          </div>
          <iframe
            key={previewKey}
            src={`/admin/preview/${article.id}`}
            className="article-preview-iframe"
            title="Article preview"
            style={{ width: '100%', flex: 1, border: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Rebuttal panel (inline) ───────────────────────────────────────

function RebuttalPanelPlaceholder({ articleId }: { articleId: string }) {
  const [targetSlug, setTargetSlug] = useState('')
  const [stance, setStance] = useState<'REBUTS' | 'EXTENDS' | 'QUALIFIES'>('REBUTS')
  const [msg, setMsg] = useState('')

  async function handle() {
    if (!targetSlug.trim()) return
    const { linkRebuttal } = await import('@/app/admin/(protected)/articles/[id]/actions')
    await linkRebuttal(articleId, targetSlug.trim(), stance)
    setMsg('Linked!')
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Link this article as a response to another article.</p>
      <div className="admin-form-field">
        <label className="admin-form-label">Target article slug</label>
        <input
          className="ref-field"
          placeholder="the-article-this-rebuts"
          value={targetSlug}
          onChange={(e) => setTargetSlug(e.target.value)}
        />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Stance</label>
        <select
          className="ref-field"
          value={stance}
          onChange={(e) => setStance(e.target.value as typeof stance)}
        >
          <option value="REBUTS">Rebuts</option>
          <option value="EXTENDS">Extends</option>
          <option value="QUALIFIES">Qualifies</option>
        </select>
      </div>
      <Button size="sm" onClick={handle}>Link rebuttal</Button>
      {msg && <p className="text-xs text-green-600">{msg}</p>}
    </div>
  )
}
