import { createContext, useContext, useEffect, useMemo } from 'react'
import { DataContainer, useReactionData } from '@/hooks'
import { Context, MediaContext } from '@/contexts/media'

export const MediaDevice = createContext<{
  data: {
    selectedMic: DataContainer<MediaDeviceInfo | undefined>
    selectedCam: DataContainer<MediaDeviceInfo | undefined>
    videoInput: DataContainer<MediaDeviceInfo[]>
    audioInput: DataContainer<MediaDeviceInfo[]>
  }
}>({
  data: {
    selectedMic: new DataContainer<MediaDeviceInfo | undefined>(undefined),
    selectedCam: new DataContainer<MediaDeviceInfo | undefined>(undefined),
    videoInput: new DataContainer<MediaDeviceInfo[]>([]),
    audioInput: new DataContainer<MediaDeviceInfo[]>([]),
  },
})

export const MediaDeviceProvider = ({ children }: { children: React.ReactNode }) => {

  const context = useMemo(() => new Context(), [])
  useEffect(() => {
    return () => { }
  }, [context])


  return <MediaContext.Provider value={context}>{children}</MediaContext.Provider>
}
