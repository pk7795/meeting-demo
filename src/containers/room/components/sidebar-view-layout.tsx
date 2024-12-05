import { cn } from '@/lib'
import { map, slice } from 'lodash'
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
        <div className={'grid h-full w-full grid-cols-[1fr_220px] gap-4'}>
          <div className={'h-full w-full'}>{renderItem(items?.[0])}</div>

          <div className={'h-full overflow-auto'}>
            {map(slice(items, 0, 1), (item, index) => (
              <div key={index} className={cn('h-36 w-full', items?.[index + 1] && 'mb-4')}>
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>
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

  return <div className={'h-full max-h-[calc(100vh-144px)] w-full duration-300'}>{renderItems}</div>
}
