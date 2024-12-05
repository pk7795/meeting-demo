import { atomWithStorage } from 'jotai/utils'
import { find } from 'lodash'
import { LayoutGrid, LayoutPanelTop } from 'lucide-react'

export const ListLayout = [
  {
    key: 'grid',
    title: 'Grid',
    icon: LayoutGrid,
    size: 16,
    description: 'Grid',
    defaultActive: true,
  },
  {
    key: 'panel',
    title: 'Panel',
    icon: LayoutPanelTop,
    size: 16,
    description: 'Panel',
    defaultActive: false,
  },
]

export const layoutSelectedAtom = atomWithStorage('layoutSelectedState', find(ListLayout, { defaultActive: true }))
