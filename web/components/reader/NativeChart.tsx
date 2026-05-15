'use client'

/**
 * NativeChart — renders a Recharts chart from ChartNative DB data.
 * Pure SVG output with no interactive JS for v1 (tooltips disabled).
 * Chart palette binds to CSS custom properties from theme.css.
 */

import {
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { ChartNativeShape } from '@/context/FigureContext'
import { formatPercent, formatNaira, formatUSD, formatNumber } from '@/lib/format'

interface NativeChartProps {
  chart: ChartNativeShape
}

// ─── Axis tick formatters ──────────────────────────────────────────

function axisFormatter(format: string): (v: unknown) => string {
  switch (format) {
    case 'PERCENT':      return (v) => formatPercent(Number(v), 0)
    case 'CURRENCY_NGN': return (v) => formatNaira(Number(v))
    case 'CURRENCY_USD': return (v) => formatUSD(Number(v))
    case 'NUMBER':       return (v) => formatNumber(Number(v))
    default:             return (v) => String(v)
  }
}

// ─── Annotation label component (multi-line SVG text) ─────────────

interface AnnotationLabelProps {
  viewBox?: { x: number; y: number; width: number; height: number }
  label: string
  position: string
}

function AnnotationLabel({ viewBox, label, position }: AnnotationLabelProps) {
  if (!viewBox) return null
  const lines = label.split('\n')
  const x = viewBox.x + viewBox.width / 2
  const y = position === 'top' ? viewBox.y - 8 : viewBox.y + viewBox.height + 18
  const lineHeight = 14

  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y - (lines.length - 1 - i) * lineHeight}
          textAnchor="middle"
          style={{
            fontFamily: 'var(--font-meta, sans-serif)',
            fontSize: 11,
            fill: 'var(--ink-soft)',
          }}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

// ─── Series type coercions ─────────────────────────────────────────

interface SeriesItem {
  key: string
  label: string
  color: string
}

interface AnnotationItem {
  x: string | number
  label: string
  position: string
}

// ─── Chart dispatcher ──────────────────────────────────────────────

export function NativeChart({ chart }: NativeChartProps) {
  const data = chart.dataJson as Record<string, unknown>[]
  const series = chart.series as SeriesItem[]
  const annotations = (chart.annotations ?? []) as AnnotationItem[]

  const yFmt = axisFormatter(chart.yAxisFormat)
  const xFmt = axisFormatter(chart.xAxisFormat)

  const gridColor = 'var(--chart-grid-color, #e0ddd8)'
  const axisStyle = {
    fontFamily: 'var(--chart-axis-font, sans-serif)',
    fontSize: 'var(--chart-axis-size, 11px)',
    fill: 'var(--chart-label-color, #888)',
  }

  const commonProps = {
    data,
    margin: { top: 32, right: 16, bottom: 24, left: 8 },
  }

  const axes = (
    <>
      <XAxis
        dataKey="time"
        tickFormatter={xFmt}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tick={axisStyle as unknown as any}
        label={{
          value: chart.xAxisLabel,
          position: 'insideBottom',
          offset: -12,
          style: { ...axisStyle, fontStyle: 'italic' } as React.CSSProperties,
        }}
      />
      <YAxis
        tickFormatter={yFmt}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tick={axisStyle as unknown as any}
        label={{
          value: chart.yAxisLabel,
          angle: -90,
          position: 'insideLeft',
          style: { ...axisStyle, fontStyle: 'italic' } as React.CSSProperties,
        }}
      />
    </>
  )

  const grid = chart.showGridlines ? (
    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
  ) : null

  const legend = chart.showLegend ? (
    <Legend
      wrapperStyle={{
        fontFamily: 'var(--chart-axis-font, sans-serif)',
        fontSize: 12,
        paddingTop: 8,
      }}
    />
  ) : null

  const refLines = annotations.map((ann, i) => (
    <ReferenceLine
      key={i}
      x={ann.x}
      stroke="var(--accent)"
      strokeDasharray="4 2"
      label={
        <AnnotationLabel label={ann.label} position={ann.position} />
      }
    />
  ))

  const renderSeries = () => {
    switch (chart.chartType) {
      case 'BAR':
      case 'COLUMN':
        return series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} />
        ))
      case 'AREA':
        return series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.15}
            dot={false}
          />
        ))
      default: // LINE
        return series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))
    }
  }

  const renderChart = () => {
    const children = (
      <>
        {grid}
        {axes}
        {legend}
        <Tooltip
          contentStyle={{
            fontFamily: 'var(--font-meta, sans-serif)',
            fontSize: 12,
            background: 'var(--bg)',
            border: '0.5px solid var(--rule)',
          }}
        />
        {refLines}
        {renderSeries()}
      </>
    )

    switch (chart.chartType) {
      case 'BAR':
      case 'COLUMN':
        return <BarChart {...commonProps}>{children}</BarChart>
      case 'AREA':
        return <AreaChart {...commonProps}>{children}</AreaChart>
      default:
        return <LineChart {...commonProps}>{children}</LineChart>
    }
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      {renderChart()}
    </ResponsiveContainer>
  )
}
