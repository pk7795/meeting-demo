'use client'

import classNames from 'classnames'
import { find, map } from 'lodash'

type Props = {
  activeKey?: string
  setActiveKey?: (key: string) => void
  items?: {
    key: string
    label: string
    children?: React.ReactNode
  }[]
}

export const Tabs: React.FC<Props> = ({ activeKey, setActiveKey, items }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between">
        {map(items, (item) => (
          <div
            key={item?.key}
            className={classNames(
              'flex-1 w-full flex items-center justify-center border-b h-16 cursor-pointer',
              activeKey === item?.key ? 'border-primary' : 'dark:border-[#232C3C]'
            )}
            onClick={() => setActiveKey?.(item?.key)}
          >
            <div
              className={classNames(
                'font-medium',
                activeKey === item?.key ? 'text-primary' : 'text-primary_text dark:text-gray-200'
              )}
            >
              {item?.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 h-full">{find(items, (item) => item?.key === activeKey)?.children}</div>
    </div>
  )
}
