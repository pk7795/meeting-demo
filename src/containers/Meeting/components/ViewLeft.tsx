'use client'

import { useOnlineMeetingParticipantsList, usePinnedParticipant } from '../contexts'
import { LocalUser } from './LocalUser'
import { RemoteUser } from './RemoteUser'
import { Col, Row } from 'antd'
import classNames from 'classnames'
import { isEmpty, map } from 'lodash'
import { useEffect } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { BlueseaStreamPriority } from '@/lib/consts'

type Props = {}

export const ViewLeft: React.FC<Props> = () => {
  const participants = useOnlineMeetingParticipantsList()
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()

  useEffect(() => {
    if (!isEmpty(participants) && !pinnedParticipant) {
      setPinnedParticipant(participants?.[0])
    }
  }, [pinnedParticipant, setPinnedParticipant, participants])

  const renderPinnedUser = () => {
    // if no user pinned then render a placeholder image
    // indicating that the user can pin a user
    if (!pinnedParticipant) {
      return null
    } else {
      if (pinnedParticipant.is_me) {
        return <LocalUser participant={pinnedParticipant} isFullScreen />
      } else {
        return <RemoteUser participant={pinnedParticipant} priority={BlueseaStreamPriority.BigVideo} isFullScreen />
      }
    }
  }
  return (
    <Row gutter={[16, 16]} className="h-full">
      <Col span={24} lg={18}>
        <div className="w-full h-[calc(100vh-160px)] relative flex items-center bg-black rounded-lg">
          {renderPinnedUser()}
        </div>
      </Col>
      <Col span={24} lg={6}>
        <Scrollbars>
          {map(participants, (u) => (
            <div
              onClick={() => setPinnedParticipant(u)}
              className={classNames(
                'mb-4 border-2 rounded-lg',
                u.id === pinnedParticipant?.id ? 'border-green-500' : 'border-transparent'
              )}
              key={u.id}
            >
              {u.is_me ? <LocalUser key={u.id} participant={u} /> : <RemoteUser key={u.id} participant={u} />}
            </div>
          ))}
        </Scrollbars>
      </Col>
    </Row>
  )
}
