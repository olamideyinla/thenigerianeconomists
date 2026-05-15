'use client'

/**
 * Figure — resolves a figure id against FigureContext and dispatches
 * to the appropriate sub-component based on the figure's kind.
 *
 * Placed via MDX directive: :::figure{id="fig-nafem-table-01"}:::
 */

import { useContext } from 'react'
import Image from 'next/image'
import { FigureContext, type FigureShape } from '@/context/FigureContext'
import { NativeChart } from './NativeChart'
import { EmbedChart } from './EmbedChart'
import { DataTableFigure } from './DataTableFigure'

interface FigureProps {
  id: string
}

// ─── Caption + source footer shared by all figure kinds ───────────

function FigureFooter({
  caption,
  source,
}: {
  caption: string
  source: string
}) {
  return (
    <>
      {caption && (
        <figcaption className="article-figure-caption">{caption}</figcaption>
      )}
      {source && (
        <div className="article-figure-source">
          <span className="kicker-label">Source</span> {source}
        </div>
      )}
    </>
  )
}

// ─── IMAGE sub-component ───────────────────────────────────────────

function ImageFigure({ fig }: { fig: FigureShape }) {
  const asset = fig.mediaAsset
  if (!asset) {
    return (
      <figure
        className="article-figure"
        data-width={fig.width.toLowerCase()}
      >
        <div className="figure-missing">Image asset not found</div>
        <FigureFooter caption={fig.caption} source={fig.source} />
      </figure>
    )
  }

  const w = asset.width ?? 1200
  const h = asset.height ?? 675

  return (
    <figure
      className="article-figure"
      data-width={fig.width.toLowerCase()}
    >
      <Image
        src={asset.publicUrl}
        alt={fig.altText ?? ''}
        width={w}
        height={h}
        placeholder={asset.blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={asset.blurDataUrl ?? undefined}
        sizes="(min-width: 1280px) 760px, (min-width: 760px) 720px, 100vw"
        style={{ width: '100%', height: 'auto' }}
      />
      <FigureFooter caption={fig.caption} source={fig.source} />
    </figure>
  )
}

// ─── Figure dispatcher ─────────────────────────────────────────────

export function Figure({ id }: FigureProps) {
  const figures = useContext(FigureContext)
  const fig = figures.find((f) => f.id === id)

  if (!fig) {
    return (
      <figure
        className="article-figure figure-error"
        aria-label={`Figure not found: ${id}`}
      >
        <div className="figure-missing" role="alert">
          Figure not found: <code>{id}</code>
        </div>
      </figure>
    )
  }

  switch (fig.kind) {
    case 'IMAGE':
      return <ImageFigure fig={fig} />

    case 'MAP':
      // v1: MAP is a specialised IMAGE rendered full-width
      return (
        <ImageFigure
          fig={{ ...fig, width: 'FULL' }}
        />
      )

    case 'CHART_NATIVE': {
      const chart = fig.chartNative
      if (!chart) return null
      return (
        <figure
          className="article-chart"
          data-width={fig.width.toLowerCase()}
        >
          <NativeChart chart={chart} />
          <FigureFooter caption={fig.caption} source={fig.source} />
        </figure>
      )
    }

    case 'CHART_EMBED': {
      const embed = fig.chartEmbed
      if (!embed) return null
      return (
        <figure
          className="article-embed"
          data-width={fig.width.toLowerCase()}
        >
          <EmbedChart embed={embed} />
          <FigureFooter caption={fig.caption} source={fig.source} />
        </figure>
      )
    }

    case 'TABLE': {
      const tbl = fig.dataTable
      if (!tbl) return null
      return (
        <figure
          className="article-figure"
          data-width={fig.width.toLowerCase()}
        >
          <DataTableFigure table={tbl} />
          <FigureFooter caption={fig.caption} source={fig.source} />
        </figure>
      )
    }

    default:
      return null
  }
}
