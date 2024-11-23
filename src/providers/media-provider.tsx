'use client'

import { Context, MediaContext } from '@/context'
import { useEffect, useMemo } from 'react'

type Props = {
  children: React.ReactNode
}

export const MediaProvider: React.FC<Props> = ({ children }) => {
  const context = useMemo(() => new Context(), [])
  useEffect(() => {
    return () => {}
  }, [context])

  return <MediaContext.Provider value={context}>{children}</MediaContext.Provider>
}
