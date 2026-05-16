'use client'

import { useEffect, useState } from 'react'
import { TopicForm } from './TopicForm'

interface Topic {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
  _count: { articles: number }
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [editing, setEditing] = useState<Topic | null>(null)

  async function load() {
    const res = await fetch('/api/admin/topics', { cache: 'no-store' })
    if (res.ok) setTopics(await res.json())
  }

  useEffect(() => { load() }, [])

  function handleSaved() {
    setEditing(null)
    load()
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Topics</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Articles</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setEditing(t)}
                  style={{ cursor: 'pointer', background: editing?.id === t.id ? 'var(--accent-veil)' : undefined }}
                >
                  <td className="text-gray-400 text-sm">{t.displayOrder}</td>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-xs font-mono text-gray-500">{t.slug}</td>
                  <td className="text-sm text-gray-500">{t._count.articles}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topics.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">No topics yet.</div>
          )}
          {topics.length > 0 && (
            <p className="text-xs text-gray-400" style={{ marginTop: 8 }}>Click a row to edit it.</p>
          )}
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            {editing ? `Edit: ${editing.name}` : 'Add topic'}
          </h2>
          <TopicForm
            key={editing?.id ?? 'new'}
            editing={editing}
            onCancel={() => setEditing(null)}
            onSaved={handleSaved}
          />
        </div>
      </div>
    </div>
  )
}
