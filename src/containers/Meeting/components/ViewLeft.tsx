'use client'

import { LocalUser } from './LocalUser'
import { RemoteUser } from './RemoteUser'
import { Col, Row } from 'antd'
import { map, times } from 'lodash'
import { MicIcon, MicOffIcon } from 'lucide-react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Icon } from '@/components'
import { useOnlineMeetingUsersList, usePinnedUser } from '@/contexts/meeting'
import { BlueseaStreamPriority } from '@/lib/consts'

type Props = {}

export const ViewLeft: React.FC<Props> = () => {
  const users = useOnlineMeetingUsersList()
  const [pinnedUser, setPinnedUser] = usePinnedUser()

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
      <Col span={18}>
        <div className="w-full h-full relative">{renderPinnedUser()}</div>
      </Col>

      <Col span={6}>
        <Scrollbars>
          {map(users, (u) => (
            <div
              onClick={() => setPinnedUser(u)}
              className={u.id === pinnedUser?.id ? 'border-4 border-lime-800' : undefined}
            >
              {u.is_me ? <LocalUser key={u.id} user={u} /> : <RemoteUser key={u.id} user={u} />}
            </div>
          ))}
        </Scrollbars>
      </Col>
    </Row>
  )
}
