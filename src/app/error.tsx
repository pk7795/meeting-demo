'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.log('--------------------------------------------------------')
    console.error('error', error)
    console.log('--------------------------------------------------------')
  }, [error])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="mb-2 text-center text-2xl font-bold">Error 500</AlertDialog.Title>
          <AlertDialog.Description className="mb-5 text-center text-gray-600">
            Sorry, something went wrong.
          </AlertDialog.Description>
          <div className="flex justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
            >
              Try again
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  )
}
