'use client'

import { LocalUser } from './LocalUser'
import { RemoteUser } from './RemoteUser'
import { Col, Row } from 'antd'
import { map } from 'lodash'
import { useOnlineMeetingUsersList } from '@/contexts'

type Props = {}

export const ViewGrid: React.FC<Props> = () => {
  const users = useOnlineMeetingUsersList()

  return (
    <Row gutter={[16, 16]}>
      {map(users, (u) => (
        <Col span={24} md={8} lg={6} key={u.id}>
          {u.is_me ? <LocalUser key={u.id} user={u} /> : <RemoteUser key={u.id} user={u} />}
        </Col>
      ))}
    </Row>
  )
}
