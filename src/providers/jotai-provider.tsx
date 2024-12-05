'use client'

import { Provider } from 'jotai'

type Props = {
  children: React.ReactNode
}

export const JotaiProvider: React.FC<Props> = ({ children }) => {
  return <Provider>{children}</Provider>
}
