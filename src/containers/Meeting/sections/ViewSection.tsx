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
import { useDevice } from '@/hooks'

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
  const { isMobile } = useDevice()


  const getColSpan = (userCount: number) => {
    if (layout !== 'GRID' || isMobile || userCount === 1 || userCount === 2) return 24;
    if (userCount <= 4) return 12;
    if (userCount <= 9) return 8;
    return 6;
  };
  const getColHeight = (userCount: number) => {
    if (layout !== 'GRID' || isMobile) return 'auto';
    if (userCount <= 2) return '100%';
    if (userCount <= 6) return '50%';
    return '33.3333%';
  }
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

  const participantCount = participants.length;
  const isAnyoneSharing = useMemo(() => {
    return participants.some(p => p.meetingStatus?.screenShare)
  }, [participants])
  useEffect(() => {
    const sharingParticipant = participants.find(p => p.meetingStatus?.screenShare)

    if (isAnyoneSharing) {
      setLayout('LEFT')
      setPinnedParticipant({ p: sharingParticipant, force: true })
    } else {
      setPinnedParticipant(null)
    }
  }, [participants, isAnyoneSharing])
  return (
    <div
      className={classNames(
        'flex items-center justify-center w-full flex-1 p-4 wrapper',
        layout !== 'GRID' ? 'flex-row' : 'flex-col'
      )}
      style={{ height: 'calc(100% - 8rem)' }}
    >
      {
        layout !== 'GRID' && (
          <div className={classNames('h-full hidden relative lg:flex items-center bg-black rounded-lg w-full mr-2 content')}>
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
        )
      }
      {showUser && (
        <div className={
          classNames('h-full relative',
            layout !== 'GRID' ? 'w-56' : 'w-full',
          )}
        >
          <Row className={classNames(layout !== 'GRID' ? 'overflow-y-auto' : 'h-full')} >
            {map(
              filter(participants, (_: any, index) => index >= page * 12 && index < (page || 1) * 12),
              (p, index) => {
                const isPinned = layout !== 'GRID' && p.id === pinnedParticipant?.p?.id
                const isLocalUserInTwoParticipants = p.is_me && participants.length === 2
                return (
                  <Col span={getColSpan(participants.length)} key={p.id}
                    style={{
                      height: isLocalUserInTwoParticipants ? "auto" : getColHeight(participants.length), padding: '0.5rem',
                      ...(isLocalUserInTwoParticipants && layout === 'GRID' && {
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        width: '14rem', // w-56
                        zIndex: 10
                      })
                    }}
                    className={isLocalUserInTwoParticipants ? 'shadow-lg rounded-lg overflow-hidden' : ''}
                  >
                    <div
                      key={index}
                      className={classNames(
                        'rounded-lg relative flex items-start justify-center h-full',
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
                        <LocalUser key={p.id} participant={p} isPinned={isPinned} layout={layout} participantCount={participantCount} />
                      ) : (
                        <RemoteUser raiseRingTone={raiseRingTone} key={p.id} participant={p} isPinned={isPinned} layout={layout} participantCount={participantCount} />
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
    </div >
  )
}
