import { LogLevel } from '@8xff/atm0s-media-react'
import request from 'request'

export interface Atm0sConfig {
  api: string
  appToken: string
  gateway: string
}

export interface Atm0sSession {
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
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Atm0s-SDK/1.0.0',
    },
    body: JSON.stringify(body),
  }
  console.log('-------------------------url on callLiveApi', url);

  return await new Promise((resolve, reject) => {
    request(options, function (error: any, response: any) {
      if (error) {
        console.error('Error on callLiveApi', error)
        return reject(new Error(error))
      }
      console.log('-------------------------callLiveApi Response', response.body)

      try {
        const data = JSON.parse(response.body)
        if (data.success === true) {
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
      'User-Agent': 'Atm0s-SDK/1.0.0',
    },
    body: JSON.stringify(body),
  }

  return await new Promise((resolve, reject) => {
    request(options, function (error: any, response: any) {
      if (error) {
        return reject(new Error(error))
      }
      console.log('-------------------------response of callGatewayApi', response);
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
  config: Atm0sConfig,
  record: boolean
): Promise<string> {
  console.log('-------------------------webrtc_session');

  const res = await callLiveApi<{ token: string }>(config.api, 'webrtc_session', config.appToken, {
    room,
    peer,
    record,
  })
  console.log('-------------------------response of createLiveWebrtcToken: ', res);
  return res.token
}

export async function createLiveRtmpToken(
  room: string,
  peer: string,
  config: Atm0sConfig,
  record: boolean
): Promise<string> {
  console.log('-------------------------rtmp_session');

  const res = await callLiveApi<{ token: string }>(config.api, 'rtmp_session', config.appToken, {
    room,
    peer,
    transcode: true,
    record,
  })
  console.log('-------------------------response of createLiveRtmpToken: ', res);
  return res.token
}

export async function createRtmpUrl(
  room: string,
  peer: string,
  token: string,
  config: Atm0sConfig
): Promise<{ rtmp_uri: string; stream_key: string }> {
  console.log('-------------------------rtmp/connect');

  const res = await callGatewayApi<{ rtmp_uri: string; rtmp_shorten_uri: string }>(config.gateway, 'rtmp/connect', {
    room,
    peer,
    token,
    audio_stream: 'audio_main',
    video_stream: 'video_main',
    shorten_link: true,
  })
  console.log('-------------------------response createRtmpUrl: ', res);
  // generate rtmp_uri and stream_key from full link res.rtmp_shorten_uri
  const parts = res.rtmp_shorten_uri.split('/live/')

  return {
    rtmp_uri: parts[0] + '/live/',
    stream_key: parts[1],
  }
}

export async function createComposeToken(room: string, config: Atm0sConfig): Promise<string> {
  console.log('-------------------------compose_session');

  const res = await callLiveApi<{ token: string }>(config.api, 'compose_session', config.appToken, {
    room,
  })
  console.log('-------------------------response of createComposeToken: ', res);
  return res.token
}

export async function submitComposeRecord(source: string, token: string, config: Atm0sConfig): Promise<string> {
  console.log('-------------------------compose/submit');

  const res = await callGatewayApi<string>(config.gateway, 'compose/submit', {
    token,
    source,
  })
  console.log('-------------------------response of submitComposeRecord: ', res);
  return res
}
