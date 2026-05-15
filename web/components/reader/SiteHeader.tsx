'use client'

import { useState } from 'react'
import { Masthead } from './Masthead'
import { SideMenu } from './SideMenu'
import { SplashOverlay } from './SplashOverlay'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <SplashOverlay />
      <Masthead onMenu={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
