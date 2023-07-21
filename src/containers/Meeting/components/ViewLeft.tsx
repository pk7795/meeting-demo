'use client'

import { LocalUser } from './LocalUser'
import { RemoteUser } from './RemoteUser'
import { Col, Row } from 'antd'
import classNames from 'classnames'
import { isEmpty, map } from 'lodash'
import { useEffect } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { useOnlineMeetingUsersList, usePinnedUser } from '@/contexts/meeting'
import { BlueseaStreamPriority } from '@/lib/consts'

type Props = {}

export const ViewLeft: React.FC<Props> = () => {
  const users = useOnlineMeetingUsersList()
  const [pinnedUser, setPinnedUser] = usePinnedUser()

  useEffect(() => {
    if (!isEmpty(users) && !pinnedUser) {
      setPinnedUser(users?.[0])
    }
  }, [pinnedUser, setPinnedUser, users])

  const renderPinnedUser = () => {
    // if no user pinned then render a placeholder image
    // indicating that the user can pin a user
    if (!pinnedUser) {
      return null
    } else {
      if (pinnedUser.is_me) {
        return <LocalUser user={pinnedUser} isFullScreen />
      } else {
        return <RemoteUser user={pinnedUser} priority={BlueseaStreamPriority.BigVideo} isFullScreen />
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
          {map(users, (u) => (
            <div
              onClick={() => setPinnedUser(u)}
              className={classNames(
                'mb-4 border-2 rounded-lg',
                u.id === pinnedUser?.id ? 'border-green-500' : 'border-transparent'
              )}
              key={u.id}
            >
              {u.is_me ? <LocalUser key={u.id} user={u} /> : <RemoteUser key={u.id} user={u} />}
            </div>
          ))}
        </Scrollbars>
      </Col>
    </Row>
  )
}
