'use client'

import { useState } from 'react'

interface LikeBarProps {
  articleSlug: string
  articleTitle?: string
  initialCount?: number
  initialLiked?: boolean
  isAuthenticated?: boolean
}

export function LikeBar({
  articleSlug,
  articleTitle = '',
  initialCount = 0,
  initialLiked = false,
  isAuthenticated = false,
}: LikeBarProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleLike() {
    if (!isAuthenticated) {
      window.location.href = `/signin?callbackUrl=${encodeURIComponent(window.location.href)}`
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleSlug}/endorse`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as { count: number; liked: boolean }
        setLiked(data.liked)
        setCount(data.count)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — fail silently
    }
  }

  const encodedUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''
  const encodedTitle = encodeURIComponent(articleTitle)
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${articleTitle} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}`
  const twitterHref = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`

  return (
    <div className="like-bar">
      {/* Endorse button */}
      <button
        className={`like-btn${liked ? ' liked' : ''}`}
        type="button"
        onClick={handleLike}
        aria-pressed={liked}
        aria-label={liked ? 'Remove endorsement' : 'Endorse this article'}
        disabled={loading}
      >
        <span className="like-glyph" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill={liked ? 'currentColor' : 'none'}
            aria-hidden="true"
          >
            <path
              d="M8 14S2 10.5 2 6.5C2 4 4 2 6.5 2c1 0 2 .5 2.5 1.5C9.5 2.5 10.5 2 11.5 2 14 2 14 4 14 6.5 14 10.5 8 14 8 14z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </span>
        <span className="like-label">Endorse</span>
        <span className="like-count">{count.toLocaleString('en-NG')}</span>
      </button>

      {/* Share buttons */}
      <div className="like-meta">
        {/* WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="like-share"
          aria-label="Share on WhatsApp"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>

        {/* X (Twitter) */}
        <a
          href={twitterHref}
          target="_blank"
          rel="noopener noreferrer"
          className="like-share"
          aria-label="Share on X"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631zM17.083 20.125h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </a>

        {/* Copy link */}
        <button
          className="like-share"
          type="button"
          onClick={handleCopy}
          aria-label="Copy link to article"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2 7l3 3 7-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="11" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1" />
                <circle cx="11" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1" />
                <circle cx="3" cy="7" r="1.5" stroke="currentColor" strokeWidth="1" />
                <path d="M9.5 3.3L4.5 6.2M9.5 10.7L4.5 7.8" stroke="currentColor" strokeWidth="1" />
              </svg>
              Copy link
            </>
          )}
        </button>
      </div>
    </div>
  )
}
