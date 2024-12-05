'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { layoutSelectedAtom, ListLayout } from '@/jotai/layout'
import { PopoverArrow, PopoverPortal } from '@radix-ui/react-popover'
import { useAtom } from 'jotai'
import { map } from 'lodash'
import { CopyIcon, LayoutPanelLeft, MessageCircle, UserRoundPlus, X } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { Drawer } from 'vaul'

type Props = {
  meetingLink?: string
}

export const SidebarRight: React.FC<Props> = ({ meetingLink }) => {
  const [layoutSelected, setLayoutSelected] = useAtom(layoutSelectedAtom)
  const [open, setOpen] = useState(false)
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
            <UserRoundPlus />
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
      <Popover open={open} onOpenChange={(value) => setOpen(value)}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className={'h-7 w-7 text-background'}>
            <LayoutPanelLeft size={18} />
          </Button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            side={'bottom'}
            className="data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade mr-5 w-[200px] rounded-lg p-4 shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] will-change-[transform,opacity] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)]"
            sideOffset={5}
          >
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-medium">Change layout</p>
              <div className={'flex gap-2'}>
                {map(ListLayout, (item) => {
                  const Icon = item.icon
                  const isActive = item?.key === layoutSelected?.key

                  return (
                    <Button
                      key={item?.key}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={'h-fit flex-col'}
                      onClick={() => {
                        setLayoutSelected(item)
                        setOpen(false)
                      }}
                    >
                      <Icon size={16} />
                      <p className={'text-xs'}>{item?.description}</p>
                    </Button>
                  )
                })}
              </div>
            </div>
            <PopoverArrow className="mr-5 fill-white" />
          </PopoverContent>
        </PopoverPortal>
      </Popover>

      <Drawer.Root direction="right">
        <Drawer.Trigger>
          <Button variant="ghost" size="icon" className={'h-7 w-7 text-background'}>
            <MessageCircle size={16} />
          </Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[10] bg-black/40" />
          <Drawer.Content
            className="fixed bottom-2 right-2 top-2 z-10 flex w-[350px] outline-none"
            style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
          >
            <div className="flex h-full w-full grow flex-col rounded-lg bg-zinc-50 p-5">
              <div className="mx-auto max-w-md">
                <Drawer.Title className="mb-2 flex items-center justify-between font-medium text-zinc-900">
                  Zoom chat
                  <Drawer.Close>
                    <X />
                  </Drawer.Close>
                </Drawer.Title>
                <Drawer.Description className="mb-2 text-zinc-600">
                  Coming soon! We are working on bringing you the best chat experience.
                </Drawer.Description>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
