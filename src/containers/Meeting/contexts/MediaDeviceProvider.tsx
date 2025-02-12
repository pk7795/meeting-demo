import { useEffect, useMemo } from 'react'
import { Context, MediaContext } from '@/contexts/media'


export const MediaDeviceProvider = ({ children }: { children: React.ReactNode }) => {

  const context = useMemo(() => new Context(), [])
  useEffect(() => {
    return () => { }
  }, [context])


  return <MediaContext.Provider value={context}>{children}</MediaContext.Provider>
}
