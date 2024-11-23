import { CameraSelection, CameraToggle, MicrophoneSelection, MicrophoneToggle } from '@/components'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Settings2Icon } from 'lucide-react'

type Props = {
  isFirstPage?: boolean
}

export const Actions: React.FC<Props> = ({ isFirstPage }) => {
  return (
    <>
      <MicrophoneToggle sourceName="audio_main" isFirstPage={isFirstPage} />
      <CameraToggle sourceName="video_main" isFirstPage={isFirstPage} />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="icon">
            <Settings2Icon size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Camera</Label>
              <CameraSelection sourceName="video_main" />
            </div>
            <div className="grid gap-2">
              <Label>Microphone</Label>
              <MicrophoneSelection sourceName="audio_main" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
