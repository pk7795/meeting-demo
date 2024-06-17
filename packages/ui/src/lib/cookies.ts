export const setCookie = (key: string, value: any, days: number) => {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${key}=${value};${expires};path=/`
}

export const getCookie = (key: string) => {
  const name = `${key}=`
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c?.charAt(0) === ' ') {
      c = c?.substring(1)
    }
    if (c?.indexOf(name) === 0) {
      return c?.substring(name.length, c?.length)
    }
  }
  return ''
}

export const removeCookie = (key: string) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
