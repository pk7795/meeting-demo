import { CameraSelection, CameraToggle, MicrophoneSelection, MicrophoneToggle } from '@atm0s-media-sdk/react-ui/lib'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
} from '@atm0s-media-sdk/ui/components/index'
import { Settings2Icon } from '@atm0s-media-sdk/ui/icons/index'

type Props = {
  first_page?: boolean
}

export const Actions: React.FC<Props> = ({ first_page }) => {
  return (
    <>
      <MicrophoneToggle source_name="audio_main" first_page={first_page} />
      <CameraToggle source_name="video_main" first_page={first_page} />
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
              <CameraSelection source_name="video_main" />
            </div>
            <div className="grid gap-2">
              <Label>Microphone</Label>
              <MicrophoneSelection source_name="audio_main" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
