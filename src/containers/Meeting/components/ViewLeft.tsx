'use client'

import { Col, Row } from 'antd'
import { map, times } from 'lodash'
import { MicIcon, MicOffIcon } from 'lucide-react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Icon } from '@/components'

type Props = {}

export const ViewLeft: React.FC<Props> = () => {
  return (
    <Row gutter={[16, 16]} className="h-full">
      <Col span={18}>
        <div className="w-full h-full relative">
          <div
            className="rounded-lg w-full h-full"
            style={{
              backgroundImage: `url(https://picsum.photos/id/237/400)`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute bottom-0 left-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg text-xs">
            Cao Havan
          </div>
          <div className="absolute bottom-0 right-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
            <Icon icon={<MicIcon size={12} />} />
          </div>
        </div>
      </Col>
      <Col span={6}>
        <Scrollbars>
          {map(
            map(times(5), (i) => ({
              key: i,
              name: `Name ${i}`,
              mic: true,
              camera: true,
            })),
            (i) => (
              <div className="w-full h-44 relative mb-4 last:mb-0" key={i?.name}>
                <div
                  className="rounded-lg w-full h-full"
                  style={{
                    backgroundImage: `url(https://picsum.photos/id/237/1500)`,
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
            )
          )}
        </Scrollbars>
      </Col>
    </Row>
  )
}
