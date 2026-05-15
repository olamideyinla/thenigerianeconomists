'use client'

import { useState } from 'react'

interface LikeBarProps {
  initialCount?: number
  articleSlug: string
}

export function LikeBar({ initialCount = 0, articleSlug: _articleSlug }: LikeBarProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)

  function handleLike() {
    setLiked(prev => !prev)
    setCount(c => (liked ? c - 1 : c + 1))
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch {
      // user cancelled or API unavailable — fail silently
    }
  }

  return (
    <div className="like-bar">
      <button
        className={`like-btn${liked ? ' liked' : ''}`}
        type="button"
        onClick={handleLike}
        aria-pressed={liked}
        aria-label={liked ? 'Remove endorsement' : 'Endorse this article'}
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

      <div className="like-meta">
        <button
          className="like-share"
          type="button"
          onClick={handleShare}
          aria-label="Share this article"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="11" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="11" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="3" cy="7" r="1.5" stroke="currentColor" strokeWidth="1" />
            <path d="M9.5 3.3L4.5 6.2M9.5 10.7L4.5 7.8" stroke="currentColor" strokeWidth="1" />
          </svg>
          Share
        </button>
      </div>
    </div>
  )
}
