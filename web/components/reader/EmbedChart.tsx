'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import type { ChartEmbedShape } from '@/context/FigureContext'

const PROVIDER_LABELS: Record<string, string> = {
  DATAWRAPPER:  'Datawrapper',
  FLOURISH:     'Flourish',
  OBSERVABLE:   'Observable',
  OTHER:        'Interactive chart',
}

interface EmbedChartProps {
  embed: ChartEmbedShape
}

export function EmbedChart({ embed }: EmbedChartProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const timer = setTimeout(() => {
      // If not loaded after 6 s, assume blocked
      if (!loaded) setBlocked(true)
    }, 6000)
    return () => clearTimeout(timer)
  }, [loaded])

  const label = PROVIDER_LABELS[embed.provider] ?? 'Interactive chart'

  // Fallback to static image if iframe blocked and fallback asset exists
  if (blocked && embed.staticFallbackAsset) {
    const asset = embed.staticFallbackAsset
    const w = asset.width ?? 1200
    const h = asset.height ?? 675
    return (
      <div className="article-embed-frame loaded">
        <Image
          src={asset.publicUrl}
          alt="Static chart fallback"
          width={w}
          height={h}
          placeholder={asset.blurDataUrl ? 'blur' : 'empty'}
          blurDataURL={asset.blurDataUrl ?? undefined}
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    )
  }

  const aspectPad = `${(embed.embedHeight / 760) * 100}%`

  return (
    <>
      <div
        className={`article-embed-frame${loaded ? ' loaded' : ''}`}
        style={{ paddingBottom: aspectPad }}
      >
        <iframe
          ref={iframeRef}
          src={embed.embedUrl}
          title={label}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          allowFullScreen={embed.allowFullscreen}
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="article-embed-credit">{label}</div>
    </>
  )
}
