'use client'

import { createContext, useContext, type ReactNode } from 'react'

/** Single reference entry — mirrors the DB Reference row shape. */
export interface RefItem {
  author: string
  year: string
  title: string
  pub?: string
  url?: string
}

export const ReferenceContext = createContext<RefItem[]>([])

export function ReferenceProvider({
  refs,
  children,
}: {
  refs: RefItem[]
  children: ReactNode
}) {
  return (
    <ReferenceContext.Provider value={refs}>
      {children}
    </ReferenceContext.Provider>
  )
}

export function useReferences(): RefItem[] {
  return useContext(ReferenceContext)
}
