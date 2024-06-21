import { Context } from './context'
import { createContext, useEffect, useMemo } from 'react'

export const Atm0sMediaUIContext = createContext<Context>({} as any)

type Props = {
  children: React.ReactNode
}

export const Atm0sMediaUIProvider: React.FC<Props> = ({ children }) => {
  const context = useMemo(() => new Context(), [])
  useEffect(() => {
    return () => {}
  }, [context])

  return <Atm0sMediaUIContext.Provider value={context}>{children}</Atm0sMediaUIContext.Provider>
}
