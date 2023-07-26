'use client'

import { LocalBigViewer, LocalUser, RemoteBigViewer, RemoteUser } from '../components'
import { useOnlineMeetingParticipantsList, usePinnedParticipant } from '../contexts'
import { Col, Row } from 'antd'
import classNames from 'classnames'
import { map } from 'lodash'
import { PinIcon, PinOffIcon } from 'lucide-react'
import Scrollbars from 'react-custom-scrollbars-2'
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

  return (
    <Row gutter={[16, 16]} className="h-full mx-0 md:-mx-2">
      {!isMobile && layout !== 'GRID' && (
        <Col span={24} lg={18}>
          <div className="w-full h-[calc(100vh-160px)] relative flex items-center bg-black rounded-lg">
            {renderBigViewer()}
          </div>
        </Col>
      )}
      <Col span={24} lg={isMobile ? 24 : layout === 'GRID' ? 24 : 6}>
        <Scrollbars>
          <Row gutter={[16, 16]} className="w-full">
            {map(participants, (p) => {
              const isPinned = layout !== 'GRID' && p.id === pinnedParticipant?.p?.id
              return (
                <Col span={isMobile ? 24 : layout === 'GRID' ? 6 : 24} key={p.id}>
                  <div
                    className={classNames(
                      'border-2 rounded-lg relative',
                      isPinned ? 'border-green-500' : 'border-transparent'
                    )}
                  >
                    <ButtonIcon
                      className="absolute top-1 left-1 z-50"
                      icon={isPinned ? <PinOffIcon size={16} /> : <PinIcon size={16} />}
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
                    />
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
