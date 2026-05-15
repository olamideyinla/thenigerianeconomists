/**
 * Tests for web/components/reader/Figure.tsx
 *
 * Mocks FigureContext, next/image, and sub-components so we can
 * test the dispatcher logic in isolation.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { FigureContext, type FigureShape } from '../context/FigureContext'
import { Figure } from '../components/reader/Figure'

// ─── Mock next/image ──────────────────────────────────────────────
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} data-testid="next-image" />
  ),
}))

// ─── Mock Recharts so NativeChart renders without DOM layout ──────
vi.mock('recharts', () => {
  const Noop = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'recharts' }, children)
  return {
    LineChart: Noop,
    BarChart: Noop,
    AreaChart: Noop,
    Line: Noop,
    Bar: Noop,
    Area: Noop,
    XAxis: Noop,
    YAxis: Noop,
    CartesianGrid: Noop,
    Legend: Noop,
    ReferenceLine: Noop,
    ResponsiveContainer: Noop,
    Tooltip: Noop,
  }
})

// ─── Fixture helpers ──────────────────────────────────────────────

function baseFigure(overrides: Partial<FigureShape> = {}): FigureShape {
  return {
    id: 'fig-test-01',
    kind: 'IMAGE',
    position: 1,
    altText: 'A test image',
    caption: 'Test caption',
    source: 'Test source',
    licenseInfo: null,
    width: 'COLUMN',
    mediaAsset: {
      id: 'asset-01',
      publicUrl: 'https://example.com/image.jpg',
      blurDataUrl: null,
      width: 800,
      height: 600,
      mimeType: 'IMAGE_JPEG',
    },
    chartEmbed: null,
    chartNative: null,
    dataTable: null,
    ...overrides,
  }
}

function renderWithFigures(figures: FigureShape[], id: string) {
  return render(
    <FigureContext.Provider value={figures}>
      <Figure id={id} />
    </FigureContext.Provider>
  )
}

// ─── Tests ────────────────────────────────────────────────────────

describe('Figure dispatcher', () => {
  // ── Missing ID ────────────────────────────────────────────────

  it('renders an error gracefully when figure id is not found in context', () => {
    renderWithFigures([], 'fig-missing')
    expect(screen.getByRole('alert')).toBeDefined()
    expect(screen.getByText(/Figure not found/i)).toBeDefined()
  })

  it('error message includes the missing id', () => {
    renderWithFigures([], 'fig-does-not-exist')
    expect(screen.getByText(/fig-does-not-exist/)).toBeDefined()
  })

  // ── IMAGE ─────────────────────────────────────────────────────

  it('renders an <img> for IMAGE kind', () => {
    renderWithFigures([baseFigure({ kind: 'IMAGE' })], 'fig-test-01')
    expect(screen.getByTestId('next-image')).toBeDefined()
  })

  it('IMAGE: renders caption and source', () => {
    renderWithFigures(
      [baseFigure({ kind: 'IMAGE', caption: 'Chart caption', source: 'CBN, 2026' })],
      'fig-test-01'
    )
    expect(screen.getByText('Chart caption')).toBeDefined()
    expect(screen.getByText(/CBN, 2026/)).toBeDefined()
  })

  it('IMAGE: renders article-figure class on the figure element', () => {
    const { container } = renderWithFigures([baseFigure({ kind: 'IMAGE' })], 'fig-test-01')
    expect(container.querySelector('.article-figure')).not.toBeNull()
  })

  it('IMAGE: renders a figure-missing notice when mediaAsset is null', () => {
    renderWithFigures(
      [baseFigure({ kind: 'IMAGE', mediaAsset: null })],
      'fig-test-01'
    )
    expect(screen.getByText(/Image asset not found/i)).toBeDefined()
  })

  // ── MAP ───────────────────────────────────────────────────────

  it('renders MAP kind same as IMAGE', () => {
    renderWithFigures([baseFigure({ kind: 'MAP' })], 'fig-test-01')
    expect(screen.getByTestId('next-image')).toBeDefined()
  })

  // ── CHART_NATIVE ──────────────────────────────────────────────

  it('renders Recharts wrapper for CHART_NATIVE kind', () => {
    const fig = baseFigure({
      kind: 'CHART_NATIVE',
      mediaAsset: null,
      chartNative: {
        id: 'cn-01',
        chartType: 'LINE',
        dataJson: [{ time: '09:00', nafem: 3.2 }],
        xAxisLabel: 'Time',
        yAxisLabel: '% turnover',
        xAxisFormat: 'TEXT',
        yAxisFormat: 'PERCENT',
        series: [{ key: 'nafem', label: 'NAFEM', color: 'var(--chart-series-1)' }],
        annotations: null,
        showLegend: true,
        showGridlines: true,
        sourceNote: 'Author analysis',
      },
    })
    renderWithFigures([fig], 'fig-test-01')
    // getAllByTestId because the mock Noop renders nested divs with the same testid
    expect(screen.getAllByTestId('recharts').length).toBeGreaterThan(0)
  })

  it('CHART_NATIVE: renders article-chart class', () => {
    const fig = baseFigure({
      kind: 'CHART_NATIVE',
      mediaAsset: null,
      chartNative: {
        id: 'cn-02',
        chartType: 'LINE',
        dataJson: [],
        xAxisLabel: '',
        yAxisLabel: '',
        xAxisFormat: 'TEXT',
        yAxisFormat: 'NUMBER',
        series: [],
        annotations: null,
        showLegend: false,
        showGridlines: false,
        sourceNote: '',
      },
    })
    const { container } = renderWithFigures([fig], 'fig-test-01')
    expect(container.querySelector('.article-chart')).not.toBeNull()
  })

  // ── TABLE ─────────────────────────────────────────────────────

  it('renders an HTML table for TABLE kind', () => {
    const fig = baseFigure({
      kind: 'TABLE',
      mediaAsset: null,
      dataTable: {
        id: 'dt-01',
        headers: ['Week', 'Published (₦bn)', 'Adjusted (₦bn)', 'Discount (%)'],
        rows: [
          ['03 Jan 2026', '598', '465', '22.2'],
          ['10 Jan 2026', '612', '478', '21.9'],
        ],
        columnAlignments: ['left', 'right', 'right', 'right'],
        columnFormats: ['TEXT', 'NUMBER', 'NUMBER', 'PERCENT'],
        sourceNote: 'CBN weekly disclosures',
      },
    })
    const { container } = renderWithFigures([fig], 'fig-test-01')
    const table = container.querySelector('.article-table')
    expect(table).not.toBeNull()
    // Header cells
    expect(screen.getByText('Week')).toBeDefined()
    expect(screen.getByText(/Published/)).toBeDefined()
    // Source note
    expect(screen.getByText(/CBN weekly disclosures/)).toBeDefined()
  })

  it('TABLE: formats PERCENT column cells correctly', () => {
    const fig = baseFigure({
      kind: 'TABLE',
      mediaAsset: null,
      dataTable: {
        id: 'dt-02',
        headers: ['Week', 'Discount (%)'],
        rows: [['03 Jan 2026', '22.2']],
        columnAlignments: ['left', 'right'],
        columnFormats: ['TEXT', 'PERCENT'],
        sourceNote: '',
      },
    })
    renderWithFigures([fig], 'fig-test-01')
    // formatPercent('22.2') = '22.2%'
    expect(screen.getByText('22.2%')).toBeDefined()
  })

  it('TABLE: plain TEXT columns pass through unchanged', () => {
    const fig = baseFigure({
      kind: 'TABLE',
      mediaAsset: null,
      dataTable: {
        id: 'dt-03',
        headers: ['Week'],
        rows: [['03 Jan 2026'], ['Q1 avg']],
        columnAlignments: ['left'],
        columnFormats: ['TEXT'],
        sourceNote: '',
      },
    })
    renderWithFigures([fig], 'fig-test-01')
    expect(screen.getByText('03 Jan 2026')).toBeDefined()
    expect(screen.getByText('Q1 avg')).toBeDefined()
  })

  // ── CHART_EMBED ───────────────────────────────────────────────

  it('renders an iframe for CHART_EMBED kind', () => {
    const fig = baseFigure({
      kind: 'CHART_EMBED',
      mediaAsset: null,
      chartEmbed: {
        id: 'ce-01',
        provider: 'DATAWRAPPER',
        embedUrl: 'https://datawrapper.dwcdn.net/abc/1/',
        embedHeight: 400,
        allowFullscreen: false,
        staticFallbackAsset: null,
      },
    })
    const { container } = renderWithFigures([fig], 'fig-test-01')
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe!.src).toContain('datawrapper')
    expect(iframe!.getAttribute('loading')).toBe('lazy')
    expect(iframe!.getAttribute('sandbox')).toContain('allow-scripts')
  })
})
