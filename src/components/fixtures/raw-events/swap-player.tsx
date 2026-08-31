import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2Icon, ReplaceIcon } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { SelectField } from '#/components/general/forms/select-field'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { FieldGroup } from '#/components/ui/field'
import { toast } from '#/components/ui/toast'
import { swapPlayerEventsFn } from '#/data/fixtures'
import { rawEventsQuery, teamPlayersQuery } from '#/lib/raw-events-queries'
import {
  swapFixturePlayersSchema,
  type SwapFixturePlayersSchema,
} from '#/lib/schemas'
import type { RawFixtureEvent, TeamPlayer } from '#/lib/types'

const rawEventsRoute = getRouteApi(
  '/_dashboard/competitions/$compId/fixtures/$fixId/raw-events',
)
const fixtureRoute = getRouteApi('/_dashboard/competitions/$compId/fixtures/$fixId')

function playerOptions(players: TeamPlayer[]) {
  return players.map((entry) => ({
    value: String(entry.player.id),
    label: `${entry.player.name} - ${entry.current_jersey_no}`,
  }))
}

function eventPlayerIds(events: RawFixtureEvent[], teamId: number) {
  const ids = new Set<string>()
  for (const event of events) {
    if (event.team !== teamId) continue
    if (event.player?.id) ids.add(String(event.player.id))
    if (event.subplayer?.id) ids.add(String(event.subplayer.id))
  }
  return ids
}

function buildDefaultValues(homeTeamId: number): SwapFixturePlayersSchema {
  return {
    teamId: String(homeTeamId),
    wrongPlayerId: '',
    rightPlayerId: '',
  }
}

export function SwapPlayerDialog() {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { fixId } = rawEventsRoute.useParams()
  const { homeTeamId, awayTeamId } = rawEventsRoute.useLoaderData()
  const { reviewStats } = fixtureRoute.useLoaderData()
  const fixture = reviewStats.fixture

  const { data: rawEvents = [] } = useQuery({
    ...rawEventsQuery(fixId),
    enabled: open,
  })
  const { data: homePlayers = [] } = useQuery({
    ...teamPlayersQuery(homeTeamId),
    enabled: open,
  })
  const { data: awayPlayers = [] } = useQuery({
    ...teamPlayersQuery(awayTeamId),
    enabled: open,
  })

  const teamOptions = useMemo(
    () => [
      { value: String(homeTeamId), label: fixture.home_team },
      { value: String(awayTeamId), label: fixture.away_team },
    ],
    [awayTeamId, fixture.away_team, fixture.home_team, homeTeamId],
  )

  const form = useForm({
    defaultValues: buildDefaultValues(homeTeamId),
    validators: {
      onSubmit: swapFixturePlayersSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await swapPlayerEventsFn({
          data: {
            fixtureId: fixId,
            wrongPlayerId: value.wrongPlayerId,
            rightPlayerId: value.rightPlayerId,
          },
        })

        await queryClient.invalidateQueries({
          queryKey: rawEventsQuery(fixId).queryKey,
        })

        toast.add({
          title: 'Players swapped',
          description: 'Match events were reassigned to the selected player.',
        })
        form.reset(buildDefaultValues(homeTeamId))
        setOpen(false)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to swap players'
        setSubmitError(message)
        toast.add({
          title: 'Swap failed',
          description: message,
        })
      }
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          form.reset(buildDefaultValues(homeTeamId))
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <ReplaceIcon className="h-4 w-4" /> Swap Player
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Swap players</DialogTitle>
          <DialogDescription>
            Reassign a player’s match events to another player on the same team.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-8"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup className="gap-8">
            <form.Field
              name="teamId"
              listeners={{
                onChange: () => {
                  form.setFieldValue('wrongPlayerId', '')
                  form.setFieldValue('rightPlayerId', '')
                },
              }}
            >
              {(field) => (
                <SelectField
                  field={field}
                  id="swap-player-team"
                  label="Team"
                  placeholder="Select team"
                  options={teamOptions}
                  orientation="vertical"
                  className="gap-3"
                  triggerClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.teamId}>
              {(teamId) => {
                const isHome = teamId === String(homeTeamId)
                const squad = isHome ? homePlayers : awayPlayers
                const taggedIds = eventPlayerIds(
                  rawEvents,
                  isHome ? homeTeamId : awayTeamId,
                )
                const taggedPlayers = squad.filter((entry) =>
                  taggedIds.has(String(entry.player.id)),
                )
                const untaggedPlayers = squad.filter(
                  (entry) => !taggedIds.has(String(entry.player.id)),
                )

                return (
                  <>
                    <form.Field name="wrongPlayerId">
                      {(field) => (
                        <SelectField
                          field={field}
                          id="swap-player-wrong"
                          label="Player to swap"
                          placeholder="Select player with events"
                          options={playerOptions(taggedPlayers)}
                          orientation="vertical"
                          className="gap-3"
                          triggerClassName="h-10 rounded-xl px-3"
                        />
                      )}
                    </form.Field>

                    <form.Field name="rightPlayerId">
                      {(field) => (
                        <SelectField
                          field={field}
                          id="swap-player-right"
                          label="Swap with"
                          placeholder="Select replacement player"
                          options={playerOptions(untaggedPlayers)}
                          orientation="vertical"
                          className="gap-3"
                          triggerClassName="h-10 rounded-xl px-3"
                        />
                      )}
                    </form.Field>
                  </>
                )
              }}
            </form.Subscribe>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                      Swapping…
                    </>
                  ) : (
                    'Swap players'
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
