'use client'

import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PlusIcon } from 'lucide-react'

import { InputField } from '#/components/general/forms/input-field'
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
import { createFixtureEventFn } from '#/data/fixtures'
import {
  metricsQuery,
  rawEventsQuery,
  teamPlayersQuery,
} from '#/lib/raw-events-queries'
import {
  createFixtureEventSchema,
  type CreateFixtureEventSchema,
} from '#/lib/schemas'
import type { Metrics, TeamPlayer } from '#/lib/types'

const rawEventsRoute = getRouteApi(
  '/_dashboard/competitions/$compId/fixtures/$fixId/raw-events',
)
const fixtureRoute = getRouteApi('/_dashboard/competitions/$compId/fixtures/$fixId')

function toIdNumber(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function isSubstitutionMetric(metric: Metrics | undefined) {
  if (!metric) return false
  if (metric.id === 17) return true
  return /substitut/i.test(metric.name)
}

function playerOptions(players: TeamPlayer[], includeNone = false) {
  const options = players.map((entry) => ({
    value: String(entry.player.id),
    label: `${entry.player.name} - ${entry.current_jersey_no}`,
  }))
  if (!includeNone) return options
  return [{ value: '0', label: 'No player (team event)' }, ...options]
}

function buildDefaultValues(homeTeamId: number): CreateFixtureEventSchema {
  return {
    teamId: String(homeTeamId),
    metricId: '',
    metricDetailId: '0',
    metricSubDetailId: '0',
    playerId: '0',
    subplayerId: '',
    moment: '',
    quarter: '',
    minute: '0',
    second: '0',
  }
}

export function AddEventDialog() {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { fixId } = rawEventsRoute.useParams()
  const { homeTeamId, awayTeamId, fixType } = rawEventsRoute.useLoaderData()
  const { reviewStats } = fixtureRoute.useLoaderData()
  const fixture = reviewStats.fixture

  const { data: metrics = [] } = useQuery({
    ...metricsQuery(fixType),
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

  const metricOptions = useMemo(
    () =>
      metrics.map((metric) => ({
        value: String(metric.id),
        label: metric.name,
      })),
    [metrics],
  )

  const form = useForm({
    defaultValues: buildDefaultValues(homeTeamId),
    validators: {
      onSubmit: createFixtureEventSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const selectedMetric = metrics.find(
        (metric) => String(metric.id) === value.metricId,
      )
      const players =
        value.teamId === String(homeTeamId) ? homePlayers : awayPlayers
      const player = players.find(
        (entry) => String(entry.player.id) === value.playerId,
      )
      const teamLabel =
        teamOptions.find((team) => team.value === value.teamId)?.label ??
        value.teamId

      const narration = isSubstitutionMetric(selectedMetric)
        ? `Substitute For ${teamLabel}`
        : player
          ? `${selectedMetric?.name ?? 'Event'} by ${player.player.name}`
          : `${selectedMetric?.name ?? 'Event'} for ${teamLabel}`

      try {
        await createFixtureEventFn({
          data: {
            fixtureId: fixId,
            body: {
              metric_id: toIdNumber(value.metricId),
              metric_detail_id: toIdNumber(value.metricDetailId),
              metric_sub_detail_id: toIdNumber(value.metricSubDetailId),
              player_id: toIdNumber(value.playerId),
              subplayer_id: toIdNumber(value.subplayerId),
              team_id: toIdNumber(value.teamId),
              minute: toIdNumber(value.minute),
              second: toIdNumber(value.second),
              moment: value.moment.trim(),
              quarter: value.quarter.trim(),
              narration,
              zone_id: 0,
              xper: '',
              yper: '',
              video_timestamp: 0,
              no_ruck: '',
              no_lineout: '',
              meter_gain: '',
              kickfrom: '',
              kickland: '',
              defender: '',
              localid: String(Math.floor(Math.random() * 10000)),
              app_timelog: new Date().toISOString(),
              sync_status: 0,
            },
          },
        })

        await queryClient.invalidateQueries({
          queryKey: rawEventsQuery(fixId).queryKey,
        })

        toast.add({
          title: 'Event created',
          description: 'Match event added successfully.',
        })
        form.reset(buildDefaultValues(homeTeamId))
        setOpen(false)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create event'
        setSubmitError(message)
        toast.add({
          title: 'Create failed',
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
            <PlusIcon className="h-4 w-4" /> Add Event
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add match event</DialogTitle>
          <DialogDescription>
            Create a new raw match event for this fixture.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup className="gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field
                name="teamId"
                listeners={{
                  onChange: () => {
                    form.setFieldValue('playerId', '0')
                    form.setFieldValue('subplayerId', '')
                  },
                }}
              >
                {(field) => (
                  <SelectField
                    field={field}
                    id="add-event-team"
                    label="Team"
                    placeholder="Select team"
                    options={teamOptions}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.teamId}>
                {(teamId) => {
                  const players =
                    teamId === String(homeTeamId) ? homePlayers : awayPlayers
                  return (
                    <form.Field name="playerId">
                      {(field) => (
                        <SelectField
                          field={field}
                          id="add-event-player"
                          label="Player"
                          placeholder="Select player (optional)"
                          options={playerOptions(players, true)}
                          orientation="vertical"
                          className="gap-2"
                          triggerClassName="h-10 rounded-xl px-3"
                        />
                      )}
                    </form.Field>
                  )
                }}
              </form.Subscribe>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field
                name="metricId"
                listeners={{
                  onChange: ({ value }) => {
                    form.setFieldValue('metricDetailId', '0')
                    form.setFieldValue('metricSubDetailId', '0')
                    if (
                      !isSubstitutionMetric(
                        metrics.find((m) => String(m.id) === value),
                      )
                    ) {
                      form.setFieldValue('subplayerId', '')
                    }
                  },
                }}
              >
                {(field) => (
                  <SelectField
                    field={field}
                    id="add-event-metric"
                    label="Event"
                    placeholder="Select event"
                    options={metricOptions}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.metricId}>
                {(metricId) => {
                  const selectedMetric = metrics.find(
                    (metric) => String(metric.id) === metricId,
                  )
                  const substitution = isSubstitutionMetric(selectedMetric)
                  const detailOptions = [
                    { value: '0', label: 'No sub event' },
                    ...(selectedMetric?.details.map((detail) => ({
                      value: String(detail.id),
                      label: detail.name,
                    })) ?? []),
                  ]

                  if (substitution) {
                    return (
                      <form.Subscribe
                        selector={(state) => state.values.teamId}
                      >
                        {(teamId) => {
                          const players =
                            teamId === String(homeTeamId)
                              ? homePlayers
                              : awayPlayers
                          return (
                            <form.Field name="subplayerId">
                              {(field) => (
                                <SelectField
                                  field={field}
                                  id="add-event-subplayer"
                                  label="Sub player in"
                                  placeholder="Select sub player"
                                  options={playerOptions(players)}
                                  orientation="vertical"
                                  className="gap-2"
                                  triggerClassName="h-10 rounded-xl px-3"
                                />
                              )}
                            </form.Field>
                          )
                        }}
                      </form.Subscribe>
                    )
                  }

                  return (
                    <form.Field
                      name="metricDetailId"
                      listeners={{
                        onChange: () => {
                          form.setFieldValue('metricSubDetailId', '0')
                        },
                      }}
                    >
                      {(field) => (
                        <SelectField
                          field={field}
                          id="add-event-detail"
                          label="Sub event"
                          placeholder="Select sub event"
                          options={detailOptions}
                          orientation="vertical"
                          className="gap-2"
                          triggerClassName="h-10 rounded-xl px-3"
                        />
                      )}
                    </form.Field>
                  )
                }}
              </form.Subscribe>
            </div>

            <form.Subscribe selector={(state) => state.values.metricId}>
              {(metricId) => {
                const selectedMetric = metrics.find(
                  (metric) => String(metric.id) === metricId,
                )
                if (isSubstitutionMetric(selectedMetric)) return null

                const subDetailOptions = [
                  { value: '0', label: 'No sub-sub event' },
                  ...(selectedMetric?.sub_details.map((detail) => ({
                    value: String(detail.id),
                    label: detail.name,
                  })) ?? []),
                ]

                return (
                  <form.Field name="metricSubDetailId">
                    {(field) => (
                      <SelectField
                        field={field}
                        id="add-event-sub-detail"
                        label="Sub-sub event"
                        placeholder="Select sub-sub event"
                        options={subDetailOptions}
                        orientation="vertical"
                        className="gap-2"
                        triggerClassName="h-10 rounded-xl px-3"
                      />
                    )}
                  </form.Field>
                )
              }}
            </form.Subscribe>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="moment">
                {(field) => (
                  <InputField
                    field={field}
                    id="add-event-moment"
                    label="Match half"
                    placeholder="firsthalf"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="quarter">
                {(field) => (
                  <InputField
                    field={field}
                    id="add-event-quarter"
                    label="Match quarter"
                    placeholder="first"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="minute">
                {(field) => (
                  <InputField
                    field={field}
                    id="add-event-minute"
                    label="Minute"
                    type="text"
                    placeholder="0"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="second">
                {(field) => (
                  <InputField
                    field={field}
                    id="add-event-second"
                    label="Seconds"
                    type="text"
                    placeholder="0"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

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
                      Creating…
                    </>
                  ) : (
                    'Create'
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
