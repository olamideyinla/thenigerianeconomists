'use client'

import { Button } from '@/components/ui/button'

export function ExportButton() {
  async function exportCsv() {
    const res = await fetch('/api/admin/subscribers/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={exportCsv}>
      Export CSV
    </Button>
  )
}
