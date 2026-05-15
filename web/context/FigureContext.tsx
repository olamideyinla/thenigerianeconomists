'use client'

import { createContext, useContext, type ReactNode } from 'react'

// ─── Inline type mirrors ───────────────────────────────────────────
// We redeclare lean shapes rather than importing Prisma client types
// so this context can be used in both Server and Client bundles.

export interface MediaAssetShape {
  id: string
  publicUrl: string
  blurDataUrl: string | null
  width: number | null
  height: number | null
  mimeType: string
}

export interface ChartEmbedShape {
  id: string
  provider: string
  embedUrl: string
  embedHeight: number
  allowFullscreen: boolean
  staticFallbackAsset: MediaAssetShape | null
}

export interface ChartNativeShape {
  id: string
  chartType: string
  dataJson: unknown
  xAxisLabel: string
  yAxisLabel: string
  xAxisFormat: string
  yAxisFormat: string
  series: unknown
  annotations: unknown | null
  showLegend: boolean
  showGridlines: boolean
  sourceNote: string
}

export interface DataTableShape {
  id: string
  headers: string[]
  rows: string[][]
  columnAlignments: string[]
  columnFormats: string[]
  sourceNote: string
}

export interface FigureShape {
  id: string
  kind: string          // FigureKind enum value
  position: number
  altText: string | null
  caption: string
  source: string
  licenseInfo: string | null
  width: string         // FigureWidth enum value
  mediaAsset: MediaAssetShape | null
  chartEmbed: ChartEmbedShape | null
  chartNative: ChartNativeShape | null
  dataTable: DataTableShape | null
}

export const FigureContext = createContext<FigureShape[]>([])

export function FigureProvider({
  figures,
  children,
}: {
  figures: FigureShape[]
  children: ReactNode
}) {
  return (
    <FigureContext.Provider value={figures}>
      {children}
    </FigureContext.Provider>
  )
}

export function useFigures(): FigureShape[] {
  return useContext(FigureContext)
}
