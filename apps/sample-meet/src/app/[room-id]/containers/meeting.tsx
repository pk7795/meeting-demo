'use client'

import { BottomBar, Viewer } from '../components'

export const Meeting = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-[calc(100vh-65px)] overflow-y-auto bg-zinc-950 p-4 flex flex-wrap flex-grow justify-center gap-4">
        {/* <div className="grow shrink min-w-[320px] min-h-[calc(100%*9/16)] md:min-w-[calc(100%/2-16px*2)] md:min-h-[calc(100%/2*9/16)] md:max-w-[calc(100%/2)] lg:min-w-[calc(100%/3-16px*2)] lg:min-h-[calc(100%/3*9/16)] lg:max-w-[calc(100%/3)] xl:min-w-[calc(100%/4-16px*2)] xl:min-h-[calc(100%/4*9/16)] xl:max-w-[calc(100%/4)]">
          <Viewer />
        </div> */}
        <div className="grow shrink">
          <Viewer />
        </div>
        <div className="grow shrink">
          <Viewer />
        </div>
      </div>
      <BottomBar />
    </div>
  )
}
