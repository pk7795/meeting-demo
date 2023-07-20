'use client'

import { Col, Row } from 'antd'
import { map, times } from 'lodash'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { Icon } from '@/components'

type Props = {}

export const ViewGrid: React.FC<Props> = () => {
  return (
    <Row gutter={[16, 16]}>
      {map(
        map(times(5), (i) => ({
          key: i,
          name: `Name ${i}`,
          mic: true,
          camera: true,
        })),
        (i) => (
          <Col span={24} md={8} lg={6} key={i?.name}>
            <div className="w-full h-44 relative">
              <div
                className="rounded-lg w-full h-full"
                style={{
                  backgroundImage: `url(https://picsum.photos/id/237/500)`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute bottom-0 left-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg text-xs">
                {i?.name}
              </div>
              <div className="absolute bottom-0 right-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
                <Icon icon={i?.mic ? <MicIcon size={12} /> : <MicOffIcon size={12} />} />
              </div>
            </div>
          </Col>
        )
      )}
    </Row>
  )
}
