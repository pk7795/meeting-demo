'use client'

import { LocalBigViewer, LocalUser, RemoteBigViewer, RemoteUser } from '../components'
import { useOnlineMeetingParticipantsList, usePinnedParticipant } from '../contexts'
import { Col, Row } from 'antd'
import classNames from 'classnames'
import { map } from 'lodash'
import { ChevronLeftIcon, ChevronRightIcon, PinIcon, PinOffIcon } from 'lucide-react'
import { useState } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { css } from '@emotion/css'
import { ButtonIcon } from '@/components'
import { useDevice } from '@/hooks'

type Props = {
  layout: 'GRID' | 'LEFT'
  setLayout: (layout: 'GRID' | 'LEFT') => void
}

export const ViewSection: React.FC<Props> = ({ layout, setLayout }) => {
  const participants = useOnlineMeetingParticipantsList()
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()
  const { isMobile } = useDevice()
  const [showUser, setShowUser] = useState(true)

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
    <Row className="h-full">
      {!isMobile && layout !== 'GRID' && (
        <Col span={24} lg={showUser ? 20 : 24}>
          <div className={classNames('h-[calc(100vh-160px)] relative flex items-center bg-black rounded-lg w-full')}>
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
        </Col>
      )}
      <Col span={24} lg={isMobile ? 24 : layout === 'GRID' ? 24 : showUser ? 4 : 0}>
        <Scrollbars className="w-full">
          <Row>
            {map(participants, (p) => {
              const isPinned = layout !== 'GRID' && p.id === pinnedParticipant?.p?.id
              return (
                <Col span={isMobile ? 24 : layout === 'GRID' ? 6 : 24} key={p.id}>
                  <div className={classNames('rounded-lg relative mx-2 mb-4 mt-0', classNameViewer)}>
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
                      <RemoteUser key={p.id} participant={p} isPinned={isPinned} />
                    )}
                  </div>
                </Col>
              )
            })}
          </Row>
        </Scrollbars>
      </Col>
    </Row>
  )
}
