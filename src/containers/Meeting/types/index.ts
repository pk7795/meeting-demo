import { MediaStreamArc, StreamConsumer, StreamConsumerPair, StreamRemote } from 'bluesea-media-react-sdk'

export type Stream = MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer

export type MicStream = MediaStreamArc | MediaStream | StreamRemote | undefined
