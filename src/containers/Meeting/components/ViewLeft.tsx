'use client'

import { LocalUser } from './LocalUser'
import { RemoteUser } from './RemoteUser'
import { Col, Row } from 'antd'
import classNames from 'classnames'
import { map } from 'lodash'
import { useEffect } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { useOnlineMeetingUsersList, usePinnedUser, useTalkingUserId } from '@/contexts/meeting'
import { BlueseaStreamPriority } from '@/lib/consts'

type Props = {}

export const ViewLeft: React.FC<Props> = () => {
  const users = useOnlineMeetingUsersList()
  const [pinnedUser, setPinnedUser] = usePinnedUser()
  const talkingUserId = useTalkingUserId()

  useEffect(() => {
    if (talkingUserId) {
      console.log('talkingUserId haha', talkingUserId)
    }
  }, [talkingUserId])
  const renderPinnedUser = () => {
    // if no user pinned then render a placeholder image
    // indicating that the user can pin a user
    if (!pinnedUser) {
      return (
        <div
          className="rounded-lg w-full h-full"
          style={{
            backgroundImage: `url(https://picsum.photos/id/237/400)`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )
    } else {
      if (pinnedUser.is_me) {
        return <LocalUser user={pinnedUser} />
      } else {
        return <RemoteUser user={pinnedUser} priority={BlueseaStreamPriority.BigVideo} />
      }
    }
  }
  return (
    <Row gutter={[16, 16]} className="h-full">
      <Col span={24} lg={16}>
        <div className="w-full h-full relative flex items-center bg-black rounded-lg p-4">{renderPinnedUser()}</div>
      </Col>
      <Col span={24} lg={8}>
        <Scrollbars>
          {map(users, (u) => (
            <div
              onClick={() => setPinnedUser(u)}
              className={classNames(
                'mb-4 border-2 rounded-lg',
                u.id === pinnedUser?.id ? 'border-primary' : 'border-transparent'
              )}
            >
              {u.is_me ? <LocalUser key={u.id} user={u} /> : <RemoteUser key={u.id} user={u} />}
            </div>
          ))}
        </Scrollbars>
      </Col>
    </Row>
  )
}
