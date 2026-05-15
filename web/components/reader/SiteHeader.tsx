'use client'

import { useState } from 'react'
import { Masthead } from './Masthead'
import { SideMenu } from './SideMenu'
import { SplashOverlay } from './SplashOverlay'
import { SearchModal } from './SearchModal'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <SplashOverlay />
      <Masthead
        onMenu={() => setMenuOpen(true)}
        onSearch={() => setSearchOpen(true)}
      />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
