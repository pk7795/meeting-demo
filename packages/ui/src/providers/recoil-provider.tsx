'use client'

import { RecoilRoot } from 'recoil'

type Props = {
  children: React.ReactNode
}

export const RecoilProvider: React.FC<Props> = ({ children }) => {
  return <RecoilRoot>{children}</RecoilRoot>
}
