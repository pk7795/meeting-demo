import { createContext, useContext, useMemo } from 'react'
import { DataContainer, useReactionData } from '@/hooks'

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
  const data = useMemo(() => {
    const selectedMic = new DataContainer<MediaDeviceInfo | undefined>(undefined)
    const selectedCam = new DataContainer<MediaDeviceInfo | undefined>(undefined)
    const videoInput = new DataContainer<MediaDeviceInfo[]>([])
    const audioInput = new DataContainer<MediaDeviceInfo[]>([])

    return {
      selectedMic,
      selectedCam,
      videoInput,
      audioInput,
    }
  }, [])

  return <MediaDevice.Provider value={{ data }}>{children}</MediaDevice.Provider>
}

export const useMediaDevice = () => {
  const context = useContext(MediaDevice)
  return context
}

export const useSelectedMic = () => {
  const context = useMediaDevice()
  const state = useReactionData<MediaDeviceInfo | undefined>(context.data.selectedMic)
  return [state, context.data.selectedMic.change] as const
}

export const useSelectedCam = () => {
  const context = useMediaDevice()
  const state = useReactionData<MediaDeviceInfo | undefined>(context.data.selectedCam)
  return [state, context.data.selectedCam.change] as const
}

export const useVideoInput = () => {
  const context = useMediaDevice()
  const state = useReactionData<MediaDeviceInfo[]>(context.data.videoInput)
  return [state, context.data.videoInput.change] as const
}

export const useAudioInput = () => {
  const context = useMediaDevice()
  const state = useReactionData<MediaDeviceInfo[]>(context.data.audioInput)
  return [state, context.data.audioInput.change] as const
}
