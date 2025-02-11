'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Copy, CopyIcon, UserRoundPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'

type Props = {
  meetingLink?: string
}

export const InviteButton: React.FC<Props> = ({ meetingLink }) => {
  const [, onCopy] = useCopyToClipboard()

  const onCopyInviteLink = () => {
    onCopy(meetingLink as string)?.then(() => {
      toast.success('Copied invite link', { duration: 2000 })
    })
  }

  return (
    <div className={'flex gap-2'}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className={'h-7 w-7 text-background'}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={'flex aspect-square h-full items-center justify-center'}>
                  <CopyIcon />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy link meeting</p>
              </TooltipContent>
            </Tooltip>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite friends</DialogTitle>
            <DialogDescription>
              <div className="grid gap-4">
                <div className="text-xs text-muted-foreground">
                  Share this meeting link with others you want in the meeting
                </div>
                <div className="flex h-10 items-center gap-2 rounded bg-zinc-200 pl-3">
                  <div className="flex-1 text-sm">{meetingLink}</div>
                  <Button variant="link" size="icon" onClick={onCopyInviteLink}>
                    <CopyIcon size={16} />
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
