import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { Rotate3DIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

export const DeleteEventDialog = () => {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={() => setOpen(!open)}>
      <AlertDialogTrigger
        render={
          <Button size={'icon'} variant={'outline'}>
            <Trash2Icon color="#f70202" className="h-4 w-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{' '}
            {/* {event.event_name} - {event.subeventname} by {event.pname}, minute{' '}
            {event.game_minute}:{event.game_second} and remove the event from */}
            our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button onClick={() => setOpen(!open)} disabled={isLoading}>
            Continue{' '}
            {isLoading && <Rotate3DIcon className="w-4 h-4 animate-spin" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
