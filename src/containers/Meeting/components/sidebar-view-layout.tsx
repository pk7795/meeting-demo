import { Button } from '@/components/ui/button'
import { useDevice } from '@/hooks'
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
  const { isMobile } = useDevice()

  if (isEmpty(remotePeerScreens)) {
    return (
      <div className={'grid h-full max-h-[calc(100vh-168px)] w-full duration-300'}>
        {renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}
      </div>
    )
  }
  const sidebarClasses = cn(
    'overflow-hidden duration-300',
    !isMobile ? 'w-[200px] flex-col flex items-end' : 'h-[140px]',
    !isExpand && 'w-0'
  )

  const peerListClasses = cn(
    'no-scrollbar flex duration-300',
    isMobile
      ? 'h-[140px] w-full overflow-x-auto space-x-4'
      : 'flex-col w-[200px] h-full items-end overflow-y-auto  space-y-4 '
  )
  const peerClass = cn('flex flex-shrink-0 items-center justify-center p-1 aspect-video', isMobile ? 'h-full' : 'justify-self-end  w-full max-h-30')
  const expandButtonClasses = cn(
    'absolute z-[2] p-2',
    isExpand && !isMobile ? 'right-40' : 'right-0',
    isExpand && isMobile ? 'bottom-36' : 'bottom-0',
    isMobile
      ? 'right-1/2 translate-x-1/2 rounded-2xl'
      : 'translate-y-1/2 rounded-2xl flex flex-col bottom-1/2',
  )
  return (
    <div className={cn('relative flex h-full w-full gap-4 duration-300', isMobile ? 'flex-col' : 'flex-row')}>
      <div className={'flex-1'}>{renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}</div>

      <div className={sidebarClasses}>
        <div className={peerListClasses}>
          {map(remotePeerScreens, (peer, index) => (
            <div key={index} className={peerClass}>
              {renderItem?.(peer || <></>) || peer}
            </div>
          ))}

          {showButtonExpand && size(remotePeerScreens) >= 1 && (
            <Button
              size={'auto'}
              onClick={() => setIsExpand((prev) => !prev)}
              className={expandButtonClasses}
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
