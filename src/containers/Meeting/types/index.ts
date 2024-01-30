import { MediaStreamArc, StreamConsumer, StreamConsumerPair, StreamRemote } from '@8xff/atm0s-media-react'

export type Stream = MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer

export type MicStream = MediaStreamArc | MediaStream | StreamRemote | undefined
