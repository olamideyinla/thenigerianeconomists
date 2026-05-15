'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updateFigure } from '@/app/admin/(protected)/articles/[id]/actions'

interface FigureRow {
  id: string
  kind: string
  position: number
  altText: string | null
  caption: string
  source: string
  width: string
}

interface FigureEditorDialogProps {
  figure: FigureRow
  onClose: () => void
  onSaved: (updated: Partial<FigureRow> & { id: string }) => void
}

export function FigureEditorDialog({ figure, onClose, onSaved }: FigureEditorDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Figure — {figure.kind}</DialogTitle>
        </DialogHeader>
        {figure.kind === 'IMAGE' && (
          <FigureEditorImage figure={figure} onSaved={onSaved} onClose={onClose} />
        )}
        {figure.kind === 'CHART_NATIVE' && (
          <FigureEditorChart figure={figure} onSaved={onSaved} onClose={onClose} />
        )}
        {figure.kind === 'CHART_EMBED' && (
          <FigureEditorEmbed figure={figure} onSaved={onSaved} onClose={onClose} />
        )}
        {figure.kind === 'TABLE' && (
          <FigureEditorTable figure={figure} onSaved={onSaved} onClose={onClose} />
        )}
        {!['IMAGE', 'CHART_NATIVE', 'CHART_EMBED', 'TABLE'].includes(figure.kind) && (
          <p className="text-sm text-gray-500">No editor available for kind: {figure.kind}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Shared fields ─────────────────────────────────────────────────

function SharedFields({
  caption,
  source,
  width,
  figureId,
  onChange,
}: {
  caption: string
  source: string
  width: string
  figureId: string
  onChange: (k: string, v: string) => void
}) {
  return (
    <>
      <div className="admin-form-field">
        <label className="admin-form-label">Figure ID</label>
        <input className="ref-field" value={figureId} readOnly style={{ background: '#f9fafb', color: '#6b7280' }} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Caption</label>
        <textarea className="ref-field" rows={2} value={caption} onChange={(e) => onChange('caption', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Source / credit</label>
        <input className="ref-field" value={source} onChange={(e) => onChange('source', e.target.value)} />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Width</label>
        <select className="ref-field" value={width} onChange={(e) => onChange('width', e.target.value)}>
          <option value="COLUMN">Column</option>
          <option value="WIDE">Wide</option>
          <option value="FULL">Full bleed</option>
        </select>
      </div>
    </>
  )
}

// ── Image editor ──────────────────────────────────────────────────

function FigureEditorImage({ figure, onSaved, onClose }: Omit<FigureEditorDialogProps, 'figure'> & { figure: FigureRow }) {
  const [fields, setFields] = useState({
    altText: figure.altText ?? '',
    caption: figure.caption,
    source: figure.source,
    width: figure.width,
  })
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [saving, setSaving] = useState(false)

  function set(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })) }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        setUploadMsg(err.error ?? 'Upload failed')
        return
      }
      const { asset } = await res.json()
      await updateFigure(figure.id, { mediaAssetId: asset.id })
      setUploadMsg('Uploaded: ' + asset.filename)
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setSaving(true)
    await updateFigure(figure.id, fields)
    setSaving(false)
    onSaved({ id: figure.id, ...fields })
  }

  const altLength = fields.altText.length
  const altValid = altLength >= 30

  return (
    <div className="space-y-3">
      <div className="admin-form-field">
        <label className="admin-form-label">
          Alt text <span className={altValid ? 'text-green-600' : 'text-red-500'}>({altLength}/30 min)</span>
        </label>
        <textarea
          className="ref-field"
          rows={2}
          value={fields.altText}
          onChange={(e) => set('altText', e.target.value)}
          placeholder="Describe the image for screen readers (≥30 chars)"
        />
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Upload image</label>
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
        {uploading && <p className="text-xs text-gray-500">Uploading…</p>}
        {uploadMsg && <p className="text-xs text-green-600">{uploadMsg}</p>}
      </div>
      <SharedFields caption={fields.caption} source={fields.source} width={fields.width} figureId={figure.id} onChange={set} />
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>Save</Button>
      </DialogFooter>
    </div>
  )
}

// ── Chart (native) editor ─────────────────────────────────────────

function FigureEditorChart({ figure, onSaved, onClose }: Omit<FigureEditorDialogProps, 'figure'> & { figure: FigureRow }) {
  const [fields, setFields] = useState({
    caption: figure.caption,
    source: figure.source,
    width: figure.width,
    chartType: 'LINE',
    xAxisLabel: '',
    yAxisLabel: '',
    csvData: '',
  })
  const [saving, setSaving] = useState(false)
  function set(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    // Parse CSV to dataJson
    const lines = fields.csvData.trim().split('\n').filter(Boolean)
    const headers = lines[0]?.split(',').map((h) => h.trim()) ?? []
    const rows = lines.slice(1).map((l) => {
      const vals = l.split(',').map((v) => v.trim())
      return Object.fromEntries(headers.map((h, i) => [h, isNaN(Number(vals[i])) ? vals[i] : Number(vals[i])]))
    })
    await updateFigure(figure.id, {
      caption: fields.caption,
      source: fields.source,
      width: fields.width,
      chartNative: {
        upsert: {
          create: { chartType: fields.chartType, dataJson: rows, xAxisLabel: fields.xAxisLabel, yAxisLabel: fields.yAxisLabel, xAxisFormat: 'TEXT', yAxisFormat: 'NUMBER', showLegend: true, showGridlines: true, sourceNote: fields.source, series: [] },
          update: { chartType: fields.chartType, dataJson: rows, xAxisLabel: fields.xAxisLabel, yAxisLabel: fields.yAxisLabel },
        },
      },
    })
    setSaving(false)
    onSaved({ id: figure.id, caption: fields.caption, source: fields.source, width: fields.width })
  }

  return (
    <div className="space-y-3">
      <div className="admin-form-field">
        <label className="admin-form-label">Chart type</label>
        <select className="ref-field" value={fields.chartType} onChange={(e) => set('chartType', e.target.value)}>
          {['LINE', 'BAR', 'COLUMN', 'STACKED_BAR', 'AREA', 'SCATTER'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="admin-form-row">
        <div className="admin-form-field">
          <label className="admin-form-label">X axis label</label>
          <input className="ref-field" value={fields.xAxisLabel} onChange={(e) => set('xAxisLabel', e.target.value)} />
        </div>
        <div className="admin-form-field">
          <label className="admin-form-label">Y axis label</label>
          <input className="ref-field" value={fields.yAxisLabel} onChange={(e) => set('yAxisLabel', e.target.value)} />
        </div>
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">CSV data (first row = headers)</label>
        <textarea className="ref-field" rows={6} value={fields.csvData} onChange={(e) => set('csvData', e.target.value)} placeholder="year,value&#10;2020,1234&#10;2021,2345" style={{ fontFamily: 'monospace', fontSize: 12 }} />
      </div>
      <SharedFields caption={fields.caption} source={fields.source} width={fields.width} figureId={figure.id} onChange={set} />
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>Save</Button>
      </DialogFooter>
    </div>
  )
}

// ── Embed editor ──────────────────────────────────────────────────

function FigureEditorEmbed({ figure, onSaved, onClose }: Omit<FigureEditorDialogProps, 'figure'> & { figure: FigureRow }) {
  const [fields, setFields] = useState({
    caption: figure.caption,
    source: figure.source,
    width: figure.width,
    embedUrl: '',
    embedHeight: 500,
  })
  const [saving, setSaving] = useState(false)
  function set(k: string, v: string | number) { setFields((f) => ({ ...f, [k]: v })) }

  function detectProvider(url: string) {
    if (url.includes('datawrapper.dwcdn')) return 'DATAWRAPPER'
    if (url.includes('flourish.studio') || url.includes('flo.uri.sh')) return 'FLOURISH'
    if (url.includes('observablehq.com')) return 'OBSERVABLE'
    return 'OTHER'
  }

  async function save() {
    setSaving(true)
    const provider = detectProvider(fields.embedUrl)
    await updateFigure(figure.id, {
      caption: fields.caption,
      source: fields.source,
      width: fields.width,
      chartEmbed: {
        upsert: {
          create: { embedUrl: fields.embedUrl, embedHeight: fields.embedHeight, allowFullscreen: true, provider },
          update: { embedUrl: fields.embedUrl, embedHeight: fields.embedHeight, provider },
        },
      },
    })
    setSaving(false)
    onSaved({ id: figure.id, caption: fields.caption, source: fields.source, width: fields.width })
  }

  return (
    <div className="space-y-3">
      <div className="admin-form-field">
        <label className="admin-form-label">Embed URL</label>
        <input className="ref-field" type="url" value={fields.embedUrl} onChange={(e) => set('embedUrl', e.target.value)} placeholder="https://datawrapper.dwcdn.net/…" />
        {fields.embedUrl && <p className="text-xs text-gray-500">Provider: {detectProvider(fields.embedUrl)}</p>}
      </div>
      <div className="admin-form-field">
        <label className="admin-form-label">Embed height (px)</label>
        <input className="ref-field" type="number" value={fields.embedHeight} onChange={(e) => set('embedHeight', Number(e.target.value))} />
      </div>
      <SharedFields caption={fields.caption} source={fields.source} width={fields.width} figureId={figure.id} onChange={(k, v) => set(k, v)} />
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>Save</Button>
      </DialogFooter>
    </div>
  )
}

// ── Table editor ──────────────────────────────────────────────────

function FigureEditorTable({ figure, onSaved, onClose }: Omit<FigureEditorDialogProps, 'figure'> & { figure: FigureRow }) {
  const [fields, setFields] = useState({
    caption: figure.caption,
    source: figure.source,
    width: figure.width,
    headers: ['Column 1', 'Column 2'],
    rows: [['', '']],
  })
  const [saving, setSaving] = useState(false)
  function setShared(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })) }

  function setHeader(i: number, v: string) {
    setFields((f) => {
      const h = [...f.headers]
      h[i] = v
      return { ...f, headers: h }
    })
  }

  function setCell(r: number, c: number, v: string) {
    setFields((f) => {
      const rows = f.rows.map((row) => [...row])
      rows[r][c] = v
      return { ...f, rows }
    })
  }

  function addCol() {
    setFields((f) => ({
      ...f,
      headers: [...f.headers, `Column ${f.headers.length + 1}`],
      rows: f.rows.map((r) => [...r, '']),
    }))
  }

  function addRow() {
    setFields((f) => ({
      ...f,
      rows: [...f.rows, f.headers.map(() => '')],
    }))
  }

  async function save() {
    setSaving(true)
    await updateFigure(figure.id, {
      caption: fields.caption,
      source: fields.source,
      width: fields.width,
      dataTable: {
        upsert: {
          create: { headers: fields.headers, rows: fields.rows, columnAlignments: fields.headers.map(() => 'LEFT'), columnFormats: fields.headers.map(() => 'TEXT'), sourceNote: fields.source },
          update: { headers: fields.headers, rows: fields.rows },
        },
      },
    })
    setSaving(false)
    onSaved({ id: figure.id, caption: fields.caption, source: fields.source, width: fields.width })
  }

  return (
    <div className="space-y-3">
      {/* Headers row */}
      <div className="admin-form-field">
        <label className="admin-form-label">Column headers</label>
        <div className="flex gap-1 flex-wrap">
          {fields.headers.map((h, i) => (
            <input key={i} className="ref-field" style={{ width: 100 }} value={h} onChange={(e) => setHeader(i, e.target.value)} />
          ))}
          <button className="text-xs px-2 py-1 bg-gray-100 rounded" onClick={addCol}>+Col</button>
        </div>
      </div>
      {/* Data rows */}
      <div className="admin-form-field">
        <label className="admin-form-label">Data rows</label>
        <div className="overflow-x-auto">
          <table style={{ fontSize: 12, borderCollapse: 'collapse' }}>
            <tbody>
              {fields.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={{ padding: 2 }}>
                      <input
                        className="ref-field"
                        style={{ width: 80 }}
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="text-xs px-2 py-1 bg-gray-100 rounded mt-1" onClick={addRow}>+ Row</button>
      </div>
      <SharedFields caption={fields.caption} source={fields.source} width={fields.width} figureId={figure.id} onChange={setShared} />
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>Save</Button>
      </DialogFooter>
    </div>
  )
}
