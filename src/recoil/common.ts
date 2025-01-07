import { atom } from 'recoil'
import { recoilPersist } from 'recoil-persist'

const { persistAtom } = recoilPersist()

export const themeState = atom<'light' | 'dark'>({
  key: 'theme',
  default: 'dark',
  effects_UNSTABLE: [persistAtom],
})
