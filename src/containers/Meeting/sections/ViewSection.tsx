'use client'

import { LocalBigViewer, LocalUser, RemoteBigViewer, RemoteUser } from '../components'
import { useOnlineMeetingParticipantsList, usePinnedParticipant } from '../contexts'
import { Col, Row } from 'antd'
import classNames from 'classnames'
import { filter, map, times } from 'lodash'
import { ChevronLeftIcon, ChevronRightIcon, PinIcon, PinOffIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { css } from '@emotion/css'
import { RAISE_HAND_RINGTONE } from '@public'
import { ButtonIcon } from '@/components'

type Props = {
  layout: 'GRID' | 'LEFT'
  setLayout: (layout: 'GRID' | 'LEFT') => void
}

export const ViewSection: React.FC<Props> = ({ layout, setLayout }) => {
  const participants = useOnlineMeetingParticipantsList()
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()
  const [showUser, setShowUser] = useState(true)
  const raiseRingTone = useMemo(() => new Audio(RAISE_HAND_RINGTONE), [])
  const [page, setPage] = useState(0)

  useEffect(() => {
    setShowUser(true)
  }, [layout])

  const renderBigViewer = () => {
    if (!pinnedParticipant?.p) {
      return null
    } else {
      if (pinnedParticipant?.p.is_me) {
        return <LocalBigViewer participant={pinnedParticipant?.p} />
      } else {
        return <RemoteBigViewer participant={pinnedParticipant?.p} />
      }
    }
  }

  const classNameViewer = css({
    '.__btn-hover': {
      display: 'none',
    },
    '&:hover': {
      '.__btn-hover': {
        display: 'flex',
      },
    },
  })

  return (
    <div
      className={classNames(
        'flex items-center justify-center w-full h-[calc(100vh-160px)] flex-1 p-4',
        layout !== 'GRID' ? 'flex-row' : 'flex-col'
      )}
    >
      {layout !== 'GRID' && (
        <div className={classNames('h-full hidden relative lg:flex items-center bg-black rounded-lg w-full mr-2')}>
          {renderBigViewer()}
          <ButtonIcon
            onClick={() => setShowUser(!showUser)}
            icon={
              showUser ? (
                <ChevronRightIcon size={16} className="text-white" />
              ) : (
                <ChevronLeftIcon size={16} className="text-white" />
              )
            }
            className="absolute right-2 bg-black bg-opacity-50"
            shape="circle"
          />
        </div>
      )}
      {showUser && (
        <div className={classNames('h-full relative', layout !== 'GRID' ? 'w-56' : 'w-full')}>
          <Row className={classNames(layout !== 'GRID' ? 'overflow-y-auto h-[calc(100%-24px)]' : '')}>
            {map(
              filter(participants, (_, index) => index >= page && index < (page || 1) * 12),
              (p, index) => {
                const isPinned = layout !== 'GRID' && p.id === pinnedParticipant?.p?.id
                return (
                  <Col span={layout !== 'GRID' ? 24 : 6}>
                    <div
                      key={index}
                      className={classNames(
                        'rounded-lg relative flex items-start justify-center mx-2 mb-4',
                        classNameViewer
                      )}
                    >
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-50 cursor-pointer w-8 h-8 rounded-full items-center justify-center __btn-hover"
                        onClick={() => {
                          if (isPinned) {
                            setPinnedParticipant(null)
                            return
                          }
                          setPinnedParticipant({
                            p,
                            force: true,
                          })
                          if (layout === 'GRID') {
                            setLayout('LEFT')
                          }
                        }}
                      >
                        {isPinned ? (
                          <PinOffIcon size={16} className="text-white" />
                        ) : (
                          <PinIcon size={16} className="text-white" />
                        )}
                      </div>
                      {p.is_me ? (
                        <LocalUser key={p.id} participant={p} isPinned={isPinned} />
                      ) : (
                        <RemoteUser raiseRingTone={raiseRingTone} key={p.id} participant={p} isPinned={isPinned} />
                      )}
                    </div>
                  </Col>
                )
              }
            )}
          </Row>
          <div
            className={classNames('flex items-center justify-center mt-6 absolute bottom-0 left-1/2 -translate-x-1/2')}
          >
            {map(times(Math.floor(participants?.length / 12) + 1), (_, index) => (
              <div
                className={classNames(
                  'w-4 h-4 flex items-center justify-center cursor-pointer',
                  participants?.length <= 12 && 'hidden'
                )}
                onClick={() => setPage(index)}
              >
                <div
                  className={classNames(
                    'rounded-full w-2 h-2',
                    index === page ? 'bg-gray-200' : 'bg-gray-200 bg-opacity-30'
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
