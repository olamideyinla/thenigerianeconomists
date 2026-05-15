'use client'

import { useState } from 'react'

interface Props {
  articleSlug: string
  initialSubscribed: boolean
  isAuthenticated: boolean
}

export function RebuttalAlertButton({ articleSlug, initialSubscribed, isAuthenticated }: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!isAuthenticated) {
      window.location.href = `/signin?callbackUrl=/articles/${articleSlug}`
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleSlug}/rebuttal-alert`, {
        method: subscribed ? 'DELETE' : 'POST',
      })
      if (res.ok) setSubscribed(!subscribed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={subscribed}
      title={
        !isAuthenticated
          ? 'Sign in to get rebuttal alerts'
          : subscribed
          ? 'You will be emailed when a response is published — click to unsubscribe'
          : 'Get emailed when a response to this article is published'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.85rem',
        fontSize: '0.8125rem',
        fontFamily: 'inherit',
        fontWeight: subscribed ? 600 : 400,
        color: subscribed ? 'var(--accent, #b45309)' : 'var(--ink-2, #555)',
        background: subscribed ? 'var(--bg-2, #f5f0e8)' : 'transparent',
        border: `1px solid ${subscribed ? 'var(--accent, #b45309)' : 'var(--border, #d4c9b0)'}`,
        borderRadius: '2px',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.15s',
        lineHeight: 1,
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={subscribed ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {subscribed ? 'Subscribed to responses' : 'Notify me of responses'}
    </button>
  )
}
