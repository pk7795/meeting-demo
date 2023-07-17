import axios from 'axios'
import qs from 'qs'
import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

const PAGE_SIZE = 10

type Arg = {
    url: string
    page?: number | string
    pageSize?: number | string
    dependencies: any[]
    query?: any
    enabled?: boolean
}

export const usePageDataQuery = (arg: Arg) => {
    const fetcher = useCallback(async () => {
        const pageSize = arg.pageSize || PAGE_SIZE
        const limit = pageSize
        const skip = Number(arg.page || 0) * Number(pageSize)
        const query = qs.stringify({
            limit,
            skip,
            ...(arg.query || {}),
        })
        const res = await axios.get(`${arg.url}${query ? `?${query}` : ''}`)
        return res?.data?.data || null
    }, [arg])

    const fn = useQuery([...arg.dependencies], fetcher, {
        refetchOnWindowFocus: false,
        retry: 5,
        enabled: arg.enabled,
    })
    return {
        ...fn,
    }
}
