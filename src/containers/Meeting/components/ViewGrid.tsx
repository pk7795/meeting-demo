'use client'

import { useOnlineMeetingParticipantsList } from '../contexts'
import { LocalUser } from './LocalUser'
import { RemoteUser } from './RemoteUser'
import { Col, Row } from 'antd'
import { map } from 'lodash'

type Props = {}

export const ViewGrid: React.FC<Props> = () => {
  const participants = useOnlineMeetingParticipantsList()

  return (
    <Row gutter={[16, 16]}>
      {map(participants, (u) => (
        <Col span={24} md={8} lg={6} key={u.id}>
          {u.is_me ? <LocalUser key={u.id} participant={u} /> : <RemoteUser key={u.id} participant={u} />}
        </Col>
      ))}
    </Row>
  )
}
