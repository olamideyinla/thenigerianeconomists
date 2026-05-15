'use client'

import { useState } from 'react'
import { Masthead } from './Masthead'
import { SideMenu } from './SideMenu'
import { SplashOverlay } from './SplashOverlay'
import { SearchModal } from './SearchModal'

interface TopicItem {
  slug: string
  name: string
  count: number
}

interface SiteHeaderProps {
  topics: TopicItem[]
}

export function SiteHeader({ topics }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <SplashOverlay />
      <Masthead
        onMenu={() => setMenuOpen(true)}
        onSearch={() => setSearchOpen(true)}
      />
      <SideMenu topics={topics} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
