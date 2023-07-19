import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useApp } from '@/components'

type Arg = {
  url: string
  method: 'POST' | 'PUT' | 'DELETE'
  data?: any
}

type Params = {
  dependencies: string[]
  onSuccess?: (res: any) => void
  onError?: (err: any) => void
}

export const useActionMutation = ({ dependencies, onSuccess, onError }: Params) => {
  const { message } = useApp()

  const fetcher = async (arg: Arg) => {
    const res = await axios({
      method: arg.method,
      url: arg.url,
      data: {
        ...arg.data,
      },
    })
    return res.data
  }

  const fn = useMutation(dependencies, {
    mutationFn: fetcher,
    onSuccess: (res) => {
      if (res?.error) {
        message.error(res?.error)
        return
      }
      onSuccess?.(res)
    },
    onError: (res) => {
      onError?.(res)
      message.error('Something went wrong. Please try again later')
    },
    retry: false,
  })
  return { ...fn }
}
