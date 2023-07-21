'use client'

import { Col, Row } from 'antd'
import {
  StreamKinds,
  useActions,
  usePublisher,
  useRemoteStreams,
  useSharedUserMedia,
  VideoViewer,
} from 'bluesea-media-react-sdk'
import { map, times } from 'lodash'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Icon } from '@/components'
import { ParticipatingUser } from '@/contexts'

type Props = {
  currentUsers?: ParticipatingUser
}

export const ViewGrid: React.FC<Props> = ({ currentUsers }) => {
  const actions = useActions()
  const [stream, streamRequester] = useSharedUserMedia('main_stream')
  const camPublisher = usePublisher({ kind: StreamKinds.VIDEO, name: 'video_main', simulcast: true })
  const micPublisher = usePublisher({ kind: StreamKinds.AUDIO, name: 'audio_main' })

  const [micStream, micError, micStreamChanger] = useSharedUserMedia('mic_device')
  const [camStream, camError, camStreamChanger] = useSharedUserMedia('camera_device')

  useEffect(() => {
    micStreamChanger({ audio: true })
    camStreamChanger({ video: true })
  }, [])

  useEffect(() => {
    micPublisher.switchStream(micStream)
  }, [micStream])

  useEffect(() => {
    camPublisher.switchStream(camStream)
  }, [camStream])

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
      <Col span={24} md={8} lg={6} key="test">
        <div className="w-full h-44 relative">
          <div className="rounded-lg w-full h-full">
            <VideoViewer autoPlay playsInline muted stream={camStream!}></VideoViewer>
          </div>
          <div className="absolute bottom-0 left-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg text-xs">
            test
          </div>
          <div className="absolute bottom-0 right-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
            <Icon icon={<MicIcon size={12} />} />
          </div>
        </div>
      </Col>
    </Row>
  )
}
