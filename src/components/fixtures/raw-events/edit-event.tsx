'use client'

import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { getRouteApi } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, PencilIcon } from 'lucide-react'

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
import { updateFixtureEventFn } from '#/data/fixtures'
import {
  metricsQuery,
  rawEventsQuery,
  teamPlayersQuery,
} from '#/lib/raw-events-queries'
import {
  editFixtureEventSchema,
  type EditFixtureEventSchema,
} from '#/lib/schemas'
import type { Metrics, RawFixtureEvent, TeamPlayer } from '#/lib/types'

const rawEventsRoute = getRouteApi(
  '/_dashboard/competitions/fixtures/$fixId/raw-events',
)
const fixtureRoute = getRouteApi('/_dashboard/competitions/fixtures/$fixId')

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

function buildDefaultValues(event: RawFixtureEvent): EditFixtureEventSchema {
  return {
    teamId: String(event.team),
    metricId: String(event.metric.id),
    metricDetailId: event.metric_detail ? String(event.metric_detail.id) : '0',
    metricSubDetailId: event.metric_sub_detail
      ? String(event.metric_sub_detail.id)
      : '0',
    playerId: event.player ? String(event.player.id) : '0',
    subplayerId: event.subplayer ? String(event.subplayer.id) : '',
    moment: event.moment ?? '',
    quarter: event.quarter ?? '',
    minute: String(event.minute ?? 0),
    second: String(event.second ?? 0),
  }
}

export function EditEventDialog({ event }: { event: RawFixtureEvent }) {
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
    defaultValues: buildDefaultValues(event),
    validators: {
      onSubmit: editFixtureEventSchema as never,
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
        await updateFixtureEventFn({
          data: {
            fixtureId: fixId,
            eventId: event.id,
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
              zone_id: event.zone_id,
              xper: event.xper,
              yper: event.yper,
              video_timestamp: event.video_timestamp,
              no_ruck: event.no_ruck,
              no_lineout: event.no_lineout,
              meter_gain: event.meter_gain,
              kickfrom: event.kickfrom,
              kickland: event.kickland,
              defender: event.defender,
              localid: event.localid,
              app_timelog: event.app_timelog || new Date().toISOString(),
              sync_status: event.sync_status,
            },
          },
        })

        await queryClient.invalidateQueries({
          queryKey: rawEventsQuery(fixId).queryKey,
        })

        toast.add({
          title: 'Event updated',
          description: 'Match event saved successfully.',
        })
        setOpen(false)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update event'
        setSubmitError(message)
        toast.add({
          title: 'Edit failed',
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
          form.reset()
          setSubmitError(null)
        } else {
          form.reset(buildDefaultValues(event))
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="icon"
            variant="outline"
            aria-label="Edit event"
            title="Edit event"
          />
        }
      >
        <PencilIcon className="h-4 w-4 text-emerald-500" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit match event</DialogTitle>
          <DialogDescription>
            Update the selected raw match event.
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
                    id={`edit-event-team-${event.id}`}
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
                          id={`edit-event-player-${event.id}`}
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
                    id={`edit-event-metric-${event.id}`}
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
                                  id={`edit-event-subplayer-${event.id}`}
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
                          id={`edit-event-detail-${event.id}`}
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
                        id={`edit-event-sub-detail-${event.id}`}
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
                    id={`edit-event-moment-${event.id}`}
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
                    id={`edit-event-quarter-${event.id}`}
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
                    id={`edit-event-minute-${event.id}`}
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
                    id={`edit-event-second-${event.id}`}
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
                      Saving…
                    </>
                  ) : (
                    'Edit'
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
