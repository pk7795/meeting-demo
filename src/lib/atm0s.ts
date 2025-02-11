import { LogLevel } from '@8xff/atm0s-media-react'
import axios from 'axios'

export interface Atm0sConfig {
  app_secret: string
  gateway: string
}

export interface peerSession {
  gateway: string
  room: string
  peer: string
  token: string
  log_level: LogLevel
}

export const generateToken = async (room: string, peer: string, gateway: string, app_secret: string): Promise<string> => {
  const rawResponse = await fetch(gateway + '/token/webrtc', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + app_secret,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room, peer, ttl: 7200 }),
    cache: 'no-cache',
  })
  if (rawResponse.status == 200) {
    const content = await rawResponse.json()
    if (content.data?.token) {
      return content.data.token
    } else {
      throw new Error(content.error_code)
    }
  } else {
    throw new Error(rawResponse.statusText)
  }
}
export const sendEmailRequest = async (
  email: string,
  senderName: string,
  meetingLink: string,
  accessToken: string,
  gateway: string
) => {
  try {
    const { data } = await axios({
      method: 'POST',
      url: `${gateway}/uss/v1/users/send_invite_meeting_link`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      data: JSON.stringify({
        email,
        inviter_name: senderName,
        meeting_link: meetingLink
      })
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}