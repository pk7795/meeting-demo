'use client'

import { LocalBigViewer, LocalUser, RemoteBigViewer, RemoteUser } from '../components'
import { useOnlineMeetingParticipantsList, usePinnedParticipant } from '../contexts'
import { Col, Row } from 'antd'
import classNames from 'classnames'
import { isEmpty, map } from 'lodash'
import { useEffect } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { useDevice } from '@/hooks'

type Props = {
  layout: 'GRID' | 'LEFT'
}

export const ViewSection: React.FC<Props> = ({ layout }) => {
  const participants = useOnlineMeetingParticipantsList()
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()
  const { isMobile } = useDevice()

  useEffect(() => {
    if (!isEmpty(participants) && !pinnedParticipant) {
      setPinnedParticipant(participants?.[0])
    }
  }, [pinnedParticipant, setPinnedParticipant, participants])

  const renderBigViewer = () => {
    if (!pinnedParticipant) {
      return null
    } else {
      if (pinnedParticipant.is_me) {
        return <LocalBigViewer participant={pinnedParticipant} />
      } else {
        return <RemoteBigViewer participant={pinnedParticipant} />
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
            {map(participants, (u) => (
              <Col span={isMobile ? 24 : layout === 'GRID' ? 6 : 24} key={u.id}>
                <div
                  onClick={() => setPinnedParticipant(u)}
                  className={classNames(
                    'border-2 rounded-lg',
                    layout !== 'GRID' && u.id === pinnedParticipant?.id ? 'border-green-500' : 'border-transparent'
                  )}
                >
                  {u.is_me ? <LocalUser key={u.id} participant={u} /> : <RemoteUser key={u.id} participant={u} />}
                </div>
              </Col>
            ))}
          </Row>
        </Scrollbars>
      </Col>
    </Row>
  )
}
