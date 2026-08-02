import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Dialog, DialogTrigger } from '#/components/ui/dialog'
import { FlipHorizontalIcon } from 'lucide-react'

export const SwapPlayerDialog = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={'sm'} variant={'outline'}>
            <FlipHorizontalIcon className="h-4 w-4" /> Swap Player
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap Player</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
