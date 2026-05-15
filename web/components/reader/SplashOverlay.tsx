'use client'

import { useState, useEffect } from 'react'

export function SplashOverlay() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-mark">
        <span className="splash-the">The</span>
        <span className="splash-ne">Nigerian Economists</span>
        <span className="splash-rule" />
        <span className="splash-tag">Rigorous economic commentary on Nigeria</span>
      </div>
    </div>
  )
}
