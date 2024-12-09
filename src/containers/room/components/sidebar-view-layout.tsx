import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { cn } from '@/lib'
import { isEmpty, map, size } from 'lodash'
import { ChevronDown, ChevronUp, UsersRound } from 'lucide-react'
import { useState } from 'react'

type Props = {
  renderItem?: (item: React.ReactNode) => React.ReactNode
  remotePeerScreens: React.ReactNode[]
  mainPeerScreen?: React.ReactNode
  showButtonExpand?: boolean
}

export const SidebarViewLayout: React.FC<Props> = ({ renderItem, remotePeerScreens, mainPeerScreen, showButtonExpand }) => {
  const [isExpand, setIsExpand] = useState(false)

  if (isEmpty(remotePeerScreens)) {
    return (
      <div className={'grid h-full max-h-[calc(100vh-168px)] w-full duration-300'}>
        {renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid h-full w-full grid-rows-[1fr_140px] gap-4 duration-300',
        isExpand ? 'grid-rows-[1fr_140px]' : 'grid-rows-1'
      )}
    >
      <>{renderItem?.(mainPeerScreen || <></>) || mainPeerScreen}</>
      <div className={'mx-12'}>
        <Carousel
          opts={{
            slidesToScroll: 1,
          }}
          className="mx-auto h-full duration-300"
        >
          <CarouselContent
            className={cn(
              'w-fit duration-300',
              size(remotePeerScreens) > 5 ? '-ml-4' : 'mx-auto',
              !isExpand && 'h-0 overflow-hidden'
            )}
          >
            {map(remotePeerScreens, (peer, index) => (
              <CarouselItem
                key={index}
                className={cn('aspect-video h-[140px] w-full basis-[calc((100vw-384px)/5)] pl-0 duration-300')}
              >
                <div className={'h-full p-1'}>{renderItem?.(peer || <></>) || peer}</div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {showButtonExpand && size(remotePeerScreens) >= 1 && (
            <Button
              size={'auto'}
              onClick={() => setIsExpand((prev) => !prev)}
              className={cn('absolute right-1/2 translate-x-1/2 rounded-2xl p-2', isExpand ? 'top-2' : '-top-10')}
            >
              {isExpand ? <ChevronDown /> : <ChevronUp />}
              <UsersRound />
            </Button>
          )}
          {size(remotePeerScreens) > 5 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      </div>
    </div>
  )
}
