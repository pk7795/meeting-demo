import { JwtTokenDecrypt, JwtTokenEncrypt } from './api'
import { cookies } from 'next/headers'

export async function getGuestIdFromCookie() {
  const cookieStore = cookies()
  const guestToken = cookieStore.get('__gtkn')
  if (!guestToken) {
    return null
  }

  const guestId = await JwtTokenDecrypt(guestToken?.value)
  return guestId
}

export async function setGuestIdToCookie(guestId: string, expires: number) {
  const cookieStore = cookies()
  cookieStore.set('__gtkn', await JwtTokenEncrypt(guestId, expires), {
    expires: new Date(Date.now() + expires * 1000),
    path: '/',
  })
}
