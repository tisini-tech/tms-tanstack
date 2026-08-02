import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { PlusIcon } from 'lucide-react'

export const AddEventDialog = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={'sm'} variant={'outline'}>
            <PlusIcon className="h-4 w-4" /> Add Event
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
