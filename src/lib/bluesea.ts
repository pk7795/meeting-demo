import { LogLevel } from 'bluesea-media-react-sdk'
import request from 'request'

export interface BlueseaConfig {
  api: string
  appToken: string
  gateway: string
}

export interface BlueseaSession {
  gateway: string
  room: string
  peer: string
  token: string
  log_level: LogLevel
}

export async function callLiveApi<T>(api: string, api_path: string, token: string, body: any): Promise<T> {
  const url = `${api}/app/${api_path}?app_secret=${token}`
  const options = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Bluesea-SDK/1.0.0',
    },
    body: JSON.stringify(body),
  }
  return await new Promise((resolve, reject) => {
    request(options, function (error: any, response: any) {
      if (error) {
        return reject(new Error(error))
      }
      try {
        const data = JSON.parse(response.body)
        if (data.status === true) {
          resolve(data.data)
        } else {
          reject(new Error(data.message || data.error || 'Unknown error'))
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

export async function callGatewayApi<T>(gateway: string, api_path: string, body: any): Promise<T> {
  const url = `${gateway}/${api_path}`
  const options = {
    method: 'POST',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Bluesea-SDK/1.0.0',
    },
    body: JSON.stringify(body),
  }
  return await new Promise((resolve, reject) => {
    request(options, function (error: any, response: any) {
      if (error) {
        return reject(new Error(error))
      }
      try {
        const data = JSON.parse(response.body)
        if (data.status === true) {
          resolve(data.data)
        } else {
          reject(new Error(data.message || data.error || 'Unknown error'))
        }
      } catch (err) {
        console.log('Parse error', url, response.body, err)
        reject(err)
      }
    })
  })
}

export async function createLiveWebrtcToken(
  room: string,
  peer: string,
  config: BlueseaConfig,
  record: boolean
): Promise<string> {
  const res = await callLiveApi<{ token: string }>(config.api, 'webrtc_session', config.appToken, {
    room,
    peer,
    record,
  })
  return res.token
}

export async function createLiveRtmpToken(
  room: string,
  peer: string,
  config: BlueseaConfig,
  record: boolean
): Promise<string> {
  const res = await callLiveApi<{ token: string }>(config.api, 'rtmp_session', config.appToken, {
    room,
    peer,
    transcode: true,
    record,
  })
  return res.token
}

export async function createRtmpUrl(
  room: string,
  peer: string,
  token: string,
  config: BlueseaConfig
): Promise<{ rtmp_uri: string; stream_key: string }> {
  const res = await callGatewayApi<{ rtmp_uri: string; rtmp_shorten_uri: string }>(config.gateway, 'rtmp/connect', {
    room,
    peer,
    token,
    audio_stream: 'audio_main',
    video_stream: 'video_main',
    shorten_link: true,
  })
  // generate rtmp_uri and stream_key from full link res.rtmp_shorten_uri
  const parts = res.rtmp_shorten_uri.split('/live/')

  return {
    rtmp_uri: parts[0] + '/live/',
    stream_key: parts[1],
  }
}

export async function createComposeToken(room: string, config: BlueseaConfig): Promise<string> {
  const res = await callLiveApi<{ token: string }>(config.api, 'compose_session', config.appToken, {
    room,
  })
  return res.token
}

export async function submitComposeRecord(source: string, token: string, config: BlueseaConfig): Promise<string> {
  const res = await callGatewayApi<string>(config.gateway, 'compose/submit', {
    token,
    source,
  })
  return res
}
