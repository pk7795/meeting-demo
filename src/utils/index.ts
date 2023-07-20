import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { v4 } from 'uuid'

dayjs.extend(utc)
dayjs.extend(timezone)

export const formatDate = (date: any) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : '')

export const genPasscode = () => v4()

export const formatDateChat = (date: Date) => (date ? dayjs(date).format('HH:mm') : '')
