import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export const formatDate = (date: any) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : '')

export const genPasscode = () => {
  const length = 10
  const date = Date.now().toString()

  let charset = ''
  charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  charset += 'abcdefghijklmnopqrstuvwxyz'
  charset += date

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export const formatDateChat = (date: Date) => (date ? dayjs(date).format('HH:mm') : '')
