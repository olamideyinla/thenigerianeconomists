import type { ReactNode } from 'react'

interface DropcapProps {
  children: ReactNode
}

/** First paragraph of an article — renders with a decorative drop capital. */
export function Dropcap({ children }: DropcapProps) {
  return <p className="para para-drop">{children}</p>
}
