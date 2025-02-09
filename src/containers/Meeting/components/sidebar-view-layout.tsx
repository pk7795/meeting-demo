import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isEmpty, map, size } from 'lodash'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, UsersRound } from 'lucide-react'
import { useState } from 'react'

type Props = {
  renderItem?: (item: React.ReactNode) => React.ReactNode
  remotePeerScreens: React.ReactNode[]
  mainPeerScreen?: React.ReactNode
  showButtonExpand?: boolean
}

export const SidebarViewLayout: React.FC<Props> = ({ renderItem, remotePeerScreens, mainPeerScreen, showButtonExpand }) => {
  const [isExpand, setIsExpand] = useState(true)

  if (isEmpty(remotePeerScreens)) {
    return (
      <div className={'grid h-full max-h-[calc(100vh-168px)] w-full duration-300'}>
        {renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}
      </div>
    )
  }
  return (
    <div className={'relative flex h-full w-full flex-row gap-4 duration-300'}>
      <div className={'flex-1'}>{renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}</div>

      <div className={cn('w-[200px] overflow-hidden duration-300 flex-col flex items-end', !isExpand && 'w-0')}>
        <div className={cn('no-scrollbar flex flex-col w-[200px] h-full space-y-4 overflow-y-auto duration-300 items-end')}>
          {map(remotePeerScreens, (peer, index) => (
            <div key={index} className={'flex aspect-video w-full max-h-30 flex-shrink-0 items-center justify-center p-1 justify-self-end'}>
              {renderItem?.(peer || <></>) || peer}
            </div>
          ))}

          {showButtonExpand && size(remotePeerScreens) >= 1 && (
            <Button
              size={'auto'}
              onClick={() => setIsExpand((prev) => !prev)}
              className={cn('absolute flex flex-col bottom-1/2 z-[2] translate-y-1/2 rounded-2yl p-2', isExpand ? 'right-40' : 'right-0')}
            >
              {/* <UsersRound /> */}
              {isExpand ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
