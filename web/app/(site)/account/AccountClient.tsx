'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'

interface User {
  id: string
  email: string | null
  name: string | null
  role: string
  createdAt: Date
}

export function AccountClient({ user }: { user: User }) {
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [delConfirm, setDelConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  async function changeEmail() {
    if (!newEmail.trim()) return
    setSaving(true)
    const res = await fetch('/api/account/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail }),
    })
    setSaving(false)
    if (res.ok) {
      setEmailMsg('Email updated. You may need to sign in again.')
      setNewEmail('')
    } else {
      const e = await res.json()
      setEmailMsg(e.error ?? 'Failed to update email.')
    }
  }

  async function deleteAccount() {
    if (delConfirm !== 'DELETE') return
    await fetch('/api/account/delete', { method: 'DELETE' })
    signOut({ callbackUrl: '/' })
  }

  return (
    <>
      {/* Profile */}
      <div className="account-section">
        <h2 className="account-section-title">Profile</h2>
        <div className="account-field">
          <span className="account-label">Name</span>
          <span className="account-value">{user.name ?? '—'}</span>
        </div>
        <div className="account-field">
          <span className="account-label">Email</span>
          <span className="account-value">{user.email ?? '—'}</span>
        </div>
        <div className="account-field">
          <span className="account-label">Role</span>
          <span className="account-badge">{user.role}</span>
        </div>
        <div className="account-field">
          <span className="account-label">Member since</span>
          <span className="account-value">{format(new Date(user.createdAt), 'd MMMM yyyy')}</span>
        </div>
      </div>

      {/* Change email */}
      <div className="account-section">
        <h2 className="account-section-title">Change email</h2>
        <div className="account-field">
          <label className="account-label" htmlFor="new-email">New email address</label>
          <input
            id="new-email"
            type="email"
            className="account-input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@example.com"
          />
        </div>
        {emailMsg && (
          <p style={{ fontSize: 13, color: emailMsg.startsWith('Email updated') ? '#16a34a' : '#dc2626', marginBottom: 8 }}>
            {emailMsg}
          </p>
        )}
        <button className="account-btn" onClick={changeEmail} disabled={saving || !newEmail.trim()}>
          {saving ? 'Saving…' : 'Update email'}
        </button>
      </div>

      {/* Sign out */}
      <div className="account-section">
        <h2 className="account-section-title">Session</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
          You are signed in. Sessions are valid for 30 days.
        </p>
        <button className="account-btn" onClick={() => signOut({ callbackUrl: '/' })}>
          Sign out
        </button>
      </div>

      {/* Delete account */}
      <div className="account-section">
        <h2 className="account-section-title" style={{ color: '#dc2626' }}>Delete account</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
          Permanently deletes your account and all associated data. This cannot be undone.
        </p>
        <div className="account-field">
          <label className="account-label" htmlFor="del-confirm">Type DELETE to confirm</label>
          <input
            id="del-confirm"
            type="text"
            className="account-input"
            value={delConfirm}
            onChange={(e) => setDelConfirm(e.target.value)}
            placeholder="DELETE"
          />
        </div>
        <button
          className="account-btn account-btn-danger"
          onClick={deleteAccount}
          disabled={delConfirm !== 'DELETE'}
        >
          Delete my account
        </button>
      </div>
    </>
  )
}
