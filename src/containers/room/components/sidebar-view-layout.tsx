import { cn } from '@/lib'
import { map } from 'lodash'
import { useMemo } from 'react'

type Props = {
  renderItem: (item: number) => React.ReactNode
  items: any[]
}

export const SidebarViewLayout: React.FC<Props> = ({ renderItem, items }) => {
  const totalUser = items.length

  const renderItems = useMemo(() => {
    if (totalUser > 1) {
      return (
        <>
          <div className={'h-full w-full duration-300'}>{renderItem(items?.[0])}</div>

          <div className={'h-full overflow-auto'}>
            {map(items, (item, index) => {
              return (
                index != 0 && (
                  <div key={index} className={cn('h-36 w-full duration-300', items?.[index + 1] && 'mb-4')}>
                    {renderItem(item)}
                  </div>
                )
              )
            })}
          </div>
        </>
      )
    }

    return map(items, (item, index) => {
      return (
        <div key={index} className={'h-full w-full duration-300'}>
          {renderItem(item)}
        </div>
      )
    })
  }, [items, renderItem, totalUser])

  return (
    <div
      className={'grid h-full max-h-[calc(100vh-65px)] w-screen grid-cols-[minmax(auto,_1fr)_220px] gap-4 p-4 duration-300'}
    >
      {renderItems}
    </div>
  )
}
