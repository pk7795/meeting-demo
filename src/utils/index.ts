import dayjs from 'dayjs'
import { v4 } from 'uuid'

export const formatDate = (date: any) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : '')

export const genPasscode = () => v4()
