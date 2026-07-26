import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { PencilIcon } from 'lucide-react'
import type { Team } from '#/lib/types'
import { UploadButton } from '#/lib/uploadthing'
import { updateTeamFn } from '#/data/teams'

export const EditTeamModal = ({ team }: { team: Team }) => {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="icon" />}>
        <PencilIcon className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team {team.name}</DialogTitle>
        </DialogHeader>

        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={async (result) => {
            const response = await updateTeamFn({
              data: { team: { ...team, teamlogo: result[0]?.ufsUrl ?? '' } },
            })
            console.log(response)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
