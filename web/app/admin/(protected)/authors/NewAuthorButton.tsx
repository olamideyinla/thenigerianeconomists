'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NewAuthorForm } from './NewAuthorForm'

export function NewAuthorButton() {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="w-full mt-4">
        <NewAuthorForm onCancel={() => setOpen(false)} />
      </div>
    )
  }

  return (
    <Button size="sm" onClick={() => setOpen(true)}>
      + New author
    </Button>
  )
}
