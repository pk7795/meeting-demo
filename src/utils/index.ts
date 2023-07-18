import dayjs from 'dayjs'

export const formatDate = (date: any) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : '')

export const genPasscode = () =>
    Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')
