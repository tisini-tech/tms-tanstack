'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { RawFixtureEvent } from '#/lib/types'
import { EditEventDialog } from './edit-event'
import { DeleteEventDialog } from './delete-event'

// import OwnGoalModal from "@/components/super-agent/own-goal-modal";
// import EditEventModal from "@/components/super-agent/edit-event-modal";
// import DeleteEventModal from "@/components/super-agent/delete-event-modal";

export const columns: ColumnDef<RawFixtureEvent>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.id}</div>
    },
  },
  {
    id: 'event_info',
    accessorFn: (row) =>
      [row.metric?.name, row.metric_detail?.name, row.metric_sub_detail?.name]
        .filter(Boolean)
        .join(' '),
    header: 'Event Info',
    cell: ({ row }) => {
      const event = row.original.metric?.name
      const subEvent = row.original.metric_detail?.name
      const subSubEvent = row.original.metric_sub_detail?.name

      return (
        <div className="flex flex-col space-y-1">
          <span className="font-medium">{event}</span>
          {subEvent && (
            <span className="text-sm text-muted-foreground">
              {subEvent} {subSubEvent ? `- ${subSubEvent}` : ''}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: 'player_info',
    accessorFn: (row) => [row.player?.name, row.team].filter(Boolean).join(' '),
    header: 'Player Info',
    cell: ({ row }) => {
      const player = row.original.player?.name
      const team = row.original.team

      return (
        <div className="flex flex-col space-y-1">
          <span className="font-medium">{player ?? '—'}</span>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{team}</span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'subplayer',
    header: 'Sub Player',
    cell: ({ row }) => row.original.subplayer?.name ?? '—',
  },
  {
    id: 'game_time',
    header: 'Game Time',
    cell: ({ row }) => {
      const minute = row.original.minute
      const second = row.original.second
      const moment = row.original.moment

      return (
        <div className="flex flex-col space-y-1 text-center">
          <span className="font-medium">
            {minute}&apos; {second}&apos;
          </span>
          <span className="text-sm text-muted-foreground">{moment}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'app_timelog',
    header: 'Time Log',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const event = row.original

      return <CleanActions event={event} />
    },
    size: 100,
  },
]

const CleanActions = ({ event }: { event: RawFixtureEvent }) => {
  return (
    <div className="flex gap-1">
      <EditEventDialog event={event} />
      <DeleteEventDialog event={event} />
    </div>
  )
}
