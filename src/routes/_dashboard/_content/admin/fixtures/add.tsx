import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm, useStore } from '@tanstack/react-form'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Loader2Icon } from 'lucide-react'
import { z } from 'zod'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { userName } from '#/components/admin/edit-user'
import { ComboboxField } from '#/components/general/forms/combobox-field'
import type { TanStackInputFieldApi } from '#/components/general/forms/input-field'
import { InputField } from '#/components/general/forms/input-field'
import { SelectField } from '#/components/general/forms/select-field'
import { FieldGroup } from '#/components/ui/field'
import { getCompetitionsFn } from '#/data/competitions'
import {
  createFixtureFn,
  getFixtureFn,
  getFixtureTypesFn,
  updateFixtureFn,
} from '#/data/fixtures'
import { createFixtureSchema } from '#/lib/schemas'
import { getTeamsFn } from '#/data/teams'
import type { Competition, Fixture, FixtureType, User, Venue } from '#/lib/types'
import { getVenuesFn } from '#/data/venues'
import { getUsersFn } from '#/data/users'

export const Route = createFileRoute('/_dashboard/_content/admin/fixtures/add')(
  {
    validateSearch: z.object({
      fixtureId: z.string().optional(),
    }),
    loaderDeps: ({ search: { fixtureId } }) => ({ fixtureId }),
    loader: async ({ deps: { fixtureId } }) => {
      const [fixtureTypes, venues, users, fixture] = await Promise.all([
        getFixtureTypesFn(),
        getVenuesFn(),
        getUsersFn(),
        fixtureId
          ? getFixtureFn({ data: { id: fixtureId } })
          : Promise.resolve(null),
      ])

      return { fixtureTypes, venues, users, fixture }
    },
    component: RouteComponent,
  },
)

const emptyDraft = {
  fixtureType: '',
  competitionId: '',
  divisionId: '',
  categoryId: '',
  seasonId: '',
  stageId: '',
  homeTeamId: '',
  awayTeamId: '',
  live: 0,
  teamView: 0,
  collectionMode: 'both',
  matchday: '',
  matchDate: '',
  matchTime: '',
  venueId: '',
  agentIds: [''],
  separateFixtures: false,
  status: 'active',
  matchStatus: 'notstarted',
  matchMoment: '',
  minute: 0,
  second: 0,
  highlightUrl: '',
  videoUrl: '',
  videoUrl2: '',
  isFeatured: false,
  appealStatus: 'none',
  appealReason: '',
  addedHalftime: '',
  addedFulltime: '',
  addedExtra: '',
  addedExtraSecond: '',
}

const collectionModes = [
  { value: 'both', label: 'Both teams' },
  { value: 'home_only', label: 'Home team only' },
  { value: 'away_only', label: 'Away team only' },
]

const fixtureStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const matchStatuses = [
  { value: 'notstarted', label: 'Not started' },
  { value: 'started', label: 'Started' },
  { value: 'HT', label: 'HT' },
  { value: 'FT', label: 'FT' },
  { value: 'ET', label: 'ET' },
  { value: 'AET', label: 'AET' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'abandoned', label: 'Abandoned' },
]

const appealStatuses = [
  { value: 'none', label: 'None' },
  { value: 'appealed', label: 'Appealed' },
  { value: 'upheld', label: 'Upheld' },
  { value: 'overturned', label: 'Overturned' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

function RouteComponent() {
  const { fixtureTypes, venues, users, fixture } = Route.useLoaderData()
  const editing = fixture != null
  const types = [...fixtureTypes].sort((a, b) => a.order_type - b.order_type)
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: fixture ? draftFromFixture(fixture) : emptyDraft,
    validators: {
      onSubmit: createFixtureSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const matchType = fixtureTypes.find(
        (type) => type.type_code === value.fixtureType,
      )
      if (!matchType) {
        setSubmitError('Select a fixture type')
        return
      }

      const data = {
        matchTypeId: matchType.id,
        homeTeamId: Number(value.homeTeamId),
        awayTeamId: Number(value.awayTeamId),
        competitionId: Number(value.competitionId),
        seasonId: Number(value.seasonId),
        divisionId: optionalId(value.divisionId),
        categoryId: optionalId(value.categoryId),
        stageId: optionalId(value.stageId),
        live: value.live,
        collectionMode: value.collectionMode as
          | 'both'
          | 'home_only'
          | 'away_only',
        matchday: value.matchday.trim(),
        matchDate: value.matchDate || null,
        matchTime: matchTimePayload(value.matchTime),
        venueId: optionalId(value.venueId),
        agentIds: [...new Set(value.agentIds.filter((id) => id !== ''))].map(
          Number,
        ),
        separateFixtures: value.separateFixtures,
      }

      try {
        if (fixture) {
          await updateFixtureFn({
            data: {
              ...data,
              fixtureId: fixture.id,
              teamView: value.teamView,
              status: value.status,
              matchStatus: value.matchStatus,
              matchMoment: value.matchMoment.trim(),
              minute: value.minute,
              second: value.second,
              highlightUrl: blankToNull(value.highlightUrl),
              videoUrl: blankToNull(value.videoUrl),
              videoUrl2: blankToNull(value.videoUrl2),
              isFeatured: value.isFeatured,
              appealStatus: value.appealStatus,
              appealReason: blankToNull(value.appealReason),
              addedHalftime: optionalNumber(value.addedHalftime),
              addedFulltime: optionalNumber(value.addedFulltime),
              addedExtra: optionalNumber(value.addedExtra),
              addedExtraSecond: optionalNumber(value.addedExtraSecond),
            },
          })
        } else {
          await createFixtureFn({ data })
        }
        await router.navigate({ to: '/admin/fixtures' })
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : fixture
              ? 'Failed to update fixture'
              : 'Failed to create fixture',
        )
      }
    },
  })
  const fixtureType = useStore(form.store, (state) => state.values.fixtureType)
  const separateFixtures = useStore(
    form.store,
    (state) => state.values.separateFixtures,
  )
  const competitionId = useStore(
    form.store,
    (state) => state.values.competitionId,
  )
  const homeTeamId = useStore(form.store, (state) => state.values.homeTeamId)
  const awayTeamId = useStore(form.store, (state) => state.values.awayTeamId)
  const [pickedCompetition, setPickedCompetition] =
    useState<Competition | null>(null)
  const rememberCompetition = useCallback((next: Competition | null) => {
    setPickedCompetition((current) => {
      if (current?.id === next?.id) return current
      return next
    })
  }, [])
  const competition =
    pickedCompetition && String(pickedCompetition.id) === competitionId
      ? pickedCompetition
      : null

  function clearCompetitionContext() {
    form.setFieldValue('divisionId', '')
    form.setFieldValue('categoryId', '')
    form.setFieldValue('seasonId', '')
    form.setFieldValue('stageId', '')
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">
          {editing ? 'Edit fixture' : 'Add fixture'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? 'Update the teams, competition, and schedule.'
            : 'Choose a fixture type, then the teams, competition, schedule, and agents.'}
        </p>
      </div>

      <form
        className="grid gap-6 xl:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <section className="space-y-4 rounded-xl border border-border p-5">
          <h2 className="text-sm font-medium text-heading">Teams</h2>
          <FieldGroup className="gap-4">
            <form.Field name="fixtureType">
              {(field) => (
                <SelectField
                  field={field}
                  id="fixture-type"
                  label="Fixture type"
                  required
                  placeholder="Select a fixture type"
                  options={types.map((type) => ({
                    value: type.type_code,
                    label: typeLabel(type),
                  }))}
                  orientation="vertical"
                  className="gap-2"
                  triggerClassName="h-10 rounded-xl"
                  onValueChange={() => {
                    form.setFieldValue('competitionId', '')
                    form.setFieldValue('homeTeamId', '')
                    form.setFieldValue('awayTeamId', '')
                    clearCompetitionContext()
                  }}
                />
              )}
            </form.Field>

            <form.Field name="homeTeamId">
              {(field) => (
                <TeamCombobox
                  field={field}
                  fixtureType={fixtureType}
                  excludeId={awayTeamId}
                  id="fixture-home-team"
                  label="Home team"
                  selected={fixture?.home_team}
                  onValueChange={(value) => {
                    if (value && value === awayTeamId) {
                      form.setFieldValue('awayTeamId', '')
                    }
                  }}
                />
              )}
            </form.Field>

            <form.Field name="awayTeamId">
              {(field) => (
                <TeamCombobox
                  field={field}
                  fixtureType={fixtureType}
                  excludeId={homeTeamId}
                  id="fixture-away-team"
                  label="Away team"
                  selected={fixture?.away_team}
                  onValueChange={(value) => {
                    if (value && value === homeTeamId) {
                      form.setFieldValue('homeTeamId', '')
                    }
                  }}
                />
              )}
            </form.Field>
          </FieldGroup>
        </section>

        <section className="space-y-4 rounded-xl border border-border p-5">
          <h2 className="text-sm font-medium text-heading">Competition</h2>
          <FieldGroup className="gap-4">
            <form.Field name="competitionId">
              {(field) => (
                <CompetitionCombobox
                  field={field}
                  fixtureType={fixtureType}
                  selected={fixture?.competition}
                  onCompetition={rememberCompetition}
                  onValueChange={() => {
                    clearCompetitionContext()
                  }}
                />
              )}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  [
                    'divisionId',
                    'fixture-division',
                    'Division',
                    competition?.divisions,
                  ],
                  [
                    'categoryId',
                    'fixture-category',
                    'Category',
                    competition?.categories,
                  ],
                  [
                    'seasonId',
                    'fixture-season',
                    'Season',
                    competition?.seasons,
                  ],
                  ['stageId', 'fixture-stage', 'Stage', competition?.stages],
                ] as const
              ).map(([name, id, label, items]) => (
                <form.Field key={name} name={name}>
                  {(field) => (
                    <SelectField
                      field={field}
                      id={id}
                      label={label}
                      required={name === 'seasonId'}
                      placeholder="------"
                      options={namedOptions(items)}
                      disabled={!competition}
                      hint={contextHint(label, Boolean(competition), items)}
                      orientation="vertical"
                      className="gap-2"
                      triggerClassName="h-10 rounded-xl"
                    />
                  )}
                </form.Field>
              ))}
            </div>
          </FieldGroup>
        </section>

        <section className="space-y-4 rounded-xl border border-border p-5 xl:col-span-2">
          <h2 className="text-sm font-medium text-heading">Schedule</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <form.Field name="venueId">
              {(field) => (
                <ComboboxField
                  field={field}
                  id="fixture-venue"
                  label="Venue"
                  placeholder="Select a venue"
                  searchPlaceholder="Search venues…"
                  emptyMessage="No venues found"
                  options={venues.map((venue) => ({
                    value: String(venue.id),
                    label: venueLabel(venue),
                  }))}
                  className="gap-2"
                />
              )}
            </form.Field>

            <form.Field name="collectionMode">
              {(field) => (
                <SelectField
                  field={field}
                  id="fixture-collection-mode"
                  label="Collection mode"
                  required
                  options={collectionModes}
                  orientation="vertical"
                  className="gap-2"
                  triggerClassName="h-10 rounded-xl"
                />
              )}
            </form.Field>

            <form.Field name="matchday">
              {(field) => (
                <InputField
                  field={field}
                  id="fixture-matchday"
                  label="Matchday"
                  required={!separateFixtures}
                  type="text"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="matchDate">
              {(field) => (
                <InputField
                  field={field}
                  id="fixture-match-date"
                  label="Match date"
                  type="date"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>
            <form.Field name="matchTime">
              {(field) => (
                <InputField
                  field={field}
                  id="fixture-match-time"
                  label="Match time"
                  type="time"
                  step={1}
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <div className="flex flex-wrap items-center gap-6 lg:col-span-2">
              <form.Field name="live">
                {(field) => (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      id="fixture-live"
                      checked={field.state.value === 1}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked ? 1 : 0)
                      }
                    />
                    Live
                  </label>
                )}
              </form.Field>
              <form.Field name="teamView">
                {(field) => (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      id="fixture-team-view"
                      checked={field.state.value === 1}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked ? 1 : 0)
                      }
                    />
                    Team view
                  </label>
                )}
              </form.Field>
            </div>
          </div>
        </section>

        {editing ? (
          <section className="space-y-4 rounded-xl border border-border p-5 xl:col-span-2">
            <h2 className="text-sm font-medium text-heading">Match state</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <form.Field name="status">
                {(field) => (
                  <SelectField
                    field={field}
                    id="fixture-status"
                    label="Status"
                    options={withCurrent(fixtureStatuses, field.state.value)}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl"
                  />
                )}
              </form.Field>
              <form.Field name="matchStatus">
                {(field) => (
                  <SelectField
                    field={field}
                    id="fixture-match-status"
                    label="Match status"
                    options={withCurrent(matchStatuses, field.state.value)}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl"
                  />
                )}
              </form.Field>
              <form.Field name="matchMoment">
                {(field) => (
                  <InputField
                    field={field}
                    id="fixture-match-moment"
                    label="Match moment"
                    type="text"
                    placeholder="halftime"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="minute">
                {(field) => (
                  <InputField
                    field={field}
                    id="fixture-minute"
                    label="Minute"
                    type="number"
                    min={0}
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="second">
                {(field) => (
                  <InputField
                    field={field}
                    id="fixture-second"
                    label="Second"
                    type="number"
                    min={0}
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="appealStatus">
                {(field) => (
                  <SelectField
                    field={field}
                    id="fixture-appeal-status"
                    label="Appeal status"
                    options={withCurrent(appealStatuses, field.state.value)}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl"
                  />
                )}
              </form.Field>
              <form.Field name="isFeatured">
                {(field) => (
                  <label className="flex h-10 cursor-pointer items-center gap-2 self-end text-sm">
                    <Checkbox
                      id="fixture-featured"
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                    />
                    Featured
                  </label>
                )}
              </form.Field>
              <form.Field name="appealReason">
                {(field) => (
                  <InputField
                    field={field}
                    id="fixture-appeal-reason"
                    label="Appeal reason"
                    type="text"
                    autoComplete="off"
                    className="gap-2 xl:col-span-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="highlightUrl">
                {(field) => (
                  <InputField
                    field={field}
                    id="fixture-highlight-url"
                    label="Highlight URL"
                    type="url"
                    autoComplete="off"
                    className="gap-2 xl:col-span-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="videoUrl">
                {(field) => (
                  <InputField
                    field={field}
                    id="fixture-video-url"
                    label="Video URL"
                    type="url"
                    autoComplete="off"
                    className="gap-2 xl:col-span-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="videoUrl2">
                {(field) => (
                  <InputField
                    field={field}
                    id="fixture-video-url-2"
                    label="Second video URL"
                    type="url"
                    autoComplete="off"
                    className="gap-2 xl:col-span-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              {(
                [
                  ['addedHalftime', 'fixture-added-ht', 'Added halftime'],
                  ['addedFulltime', 'fixture-added-ft', 'Added fulltime'],
                  ['addedExtra', 'fixture-added-extra', 'Added extra'],
                  [
                    'addedExtraSecond',
                    'fixture-added-extra-2',
                    'Added extra second',
                  ],
                ] as const
              ).map(([name, id, label]) => (
                <form.Field key={name} name={name}>
                  {(field) => (
                    <InputField
                      field={field}
                      id={id}
                      label={label}
                      type="text"
                      autoComplete="off"
                      placeholder="Minutes"
                      className="gap-2"
                      inputClassName="h-10 rounded-xl px-3"
                    />
                  )}
                </form.Field>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4 rounded-xl border border-border p-5 xl:col-span-2">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-heading">Agents</h2>
            <p className="text-sm text-muted-foreground">
              {editing
                ? 'Change the agents assigned to this match. Use "Add another agent" to assign more than one.'
                : 'Optional — assign one or more agents to this match. Use "Add another agent" to assign more than one.'}
            </p>
          </div>
          <form.Field name="agentIds">
            {(agents) => (
              <div className="max-w-md space-y-4">
                {agents.state.value.map((_, index) => (
                  <div key={index} className="flex items-end gap-3">
                    <form.Field name={`agentIds[${index}]`}>
                      {(field) => (
                        <AgentCombobox
                          field={field}
                          initialUsers={users.results}
                          selected={fixture?.agents?.find(
                            (agent) => String(agent.id) === field.state.value,
                          )}
                          takenIds={agents.state.value.filter(
                            (id, agentIndex) =>
                              agentIndex !== index && id !== '',
                          )}
                          className="min-w-0 flex-1"
                        />
                      )}
                    </form.Field>
                    {agents.state.value.length > 1 ? (
                      <button
                        type="button"
                        className="mb-2 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => agents.removeValue(index)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => agents.pushValue('')}
                >
                  Add another agent
                </button>
                {agents.state.meta.errors.length > 0 ? (
                  <p className="text-sm text-destructive">
                    Select at least one agent
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
          {editing ? null : (
            <form.Field name="separateFixtures">
              {(field) => (
                <label className="flex max-w-lg cursor-pointer items-start gap-2 text-sm">
                  <Checkbox
                    id="fixture-separate"
                    className="mt-0.5"
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <span>
                    Create a separate fixture for each agent
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Each selected agent gets their own match, with their name
                      as the matchday.
                    </span>
                  </span>
                </label>
              )}
            </form.Field>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3 xl:col-span-2">
          {submitError ? (
            <p className="mr-auto text-sm text-destructive">{submitError}</p>
          ) : null}
          <form.Subscribe
            selector={(state) => ({
              isSubmitting: state.isSubmitting,
              separateFixtures: state.values.separateFixtures,
            })}
          >
            {({ isSubmitting, separateFixtures: separate }) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    {editing ? 'Saving…' : 'Creating…'}
                  </>
                ) : editing ? (
                  'Save changes'
                ) : separate ? (
                  'Create a fixture for each agent'
                ) : (
                  'Create fixture'
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}

function idValue(value: { id: number } | null | undefined) {
  return value?.id != null ? String(value.id) : ''
}

function draftFromFixture(fixture: Fixture) {
  const mode = fixture.collection_mode
  const collectionMode =
    mode === 'home_only' || mode === 'away_only' || mode === 'both'
      ? mode
      : 'both'

  return {
    fixtureType: fixture.match_type?.type_code ?? '',
    competitionId: idValue(fixture.competition),
    divisionId: idValue(fixture.division),
    categoryId: idValue(fixture.category),
    seasonId: idValue(fixture.season),
    stageId: idValue(fixture.stage),
    homeTeamId: idValue(fixture.home_team),
    awayTeamId: idValue(fixture.away_team),
    live: fixture.live ?? 0,
    teamView: fixture.team_view ?? 0,
    collectionMode,
    matchday: fixture.matchday ?? '',
    matchDate: fixture.match_date?.slice(0, 10) ?? '',
    matchTime: fixture.match_time?.trim().slice(0, 8) ?? '',
    venueId: idValue(fixture.venue),
    agentIds: agentDraft(fixture.agents),
    separateFixtures: false,
    status: fixture.status || 'active',
    matchStatus: fixture.match_status || 'notstarted',
    matchMoment: fixture.match_moment ?? '',
    minute: fixture.minute ?? 0,
    second: fixture.second ?? 0,
    highlightUrl: fixture.highlight_url ?? '',
    videoUrl: fixture.video_url ?? '',
    videoUrl2: fixture.video_url2 ?? '',
    isFeatured: fixture.is_featured ?? false,
    appealStatus: fixture.appeal_status || 'none',
    appealReason: fixture.appeal_reason ?? '',
    addedHalftime: numberText(fixture.added_halftime),
    addedFulltime: numberText(fixture.added_fulltime),
    addedExtra: numberText(fixture.added_extra),
    addedExtraSecond: numberText(fixture.added_extra_second),
  }
}

function agentDraft(agents: Array<{ id: number }> | undefined) {
  const values = (agents ?? [])
    .filter((agent) => Number.isFinite(agent.id))
    .map((agent) => String(agent.id))
  return values.length > 0 ? values : ['']
}

function blankToNull(value: string) {
  const trimmed = value.trim()
  return trimmed || null
}

function optionalNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

function numberText(value: number | null | undefined) {
  return value == null ? '' : String(value)
}

function withCurrent(options: Array<{ value: string; label: string }>, current: string) {
  if (!current || options.some((option) => option.value === current)) {
    return options
  }
  return [{ value: current, label: current }, ...options]
}

function optionalId(value: string) {
  if (!value) return null
  const id = Number(value)
  return Number.isFinite(id) ? id : null
}

function matchTimePayload(value: string) {
  const time = value.trim()
  if (!time) return null
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`
  return time
}

function useDebouncedSearch() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  return { setQuery, debounced }
}

function TeamCombobox({
  field,
  fixtureType,
  excludeId,
  id,
  label,
  selected,
  onValueChange,
}: {
  field: TanStackInputFieldApi<string>
  fixtureType: string
  excludeId: string
  id: string
  label: string
  selected?: { id: number; name: string } | null
  onValueChange?: (value: string) => void
}) {
  const { setQuery, debounced } = useDebouncedSearch()
  const teams = useQuery({
    queryKey: ['fixture-teams', fixtureType, debounced],
    queryFn: () =>
      getTeamsFn({
        data: {
          teamType: fixtureType,
          search: debounced || undefined,
          pageSize: debounced ? 50 : 20,
        },
      }),
    enabled: fixtureType.length > 0,
  })

  const options = useMemo(() => {
    const rows = (teams.data ?? [])
      .filter((team) => String(team.id) !== excludeId)
      .map((team) => ({
        value: String(team.id),
        label: team.name,
      }))
    if (
      selected &&
      String(selected.id) === field.state.value &&
      field.state.value !== excludeId &&
      !rows.some((team) => team.value === field.state.value)
    ) {
      return [{ value: field.state.value, label: selected.name }, ...rows]
    }
    return rows
  }, [teams.data, excludeId, selected, field.state.value])

  return (
    <ComboboxField
      field={field}
      id={id}
      label={label}
      required
      placeholder="Select a team"
      searchPlaceholder="Search teams…"
      emptyMessage={
        debounced && teams.isFetching ? 'Searching…' : 'No teams found'
      }
      options={options}
      disabled={!fixtureType}
      onSearchChange={setQuery}
      onValueChange={onValueChange}
      hint={
        !fixtureType
          ? 'Select a fixture type first, then search for a team.'
          : teams.error instanceof Error
            ? teams.error.message
            : undefined
      }
      className="gap-2"
    />
  )
}

function CompetitionCombobox({
  field,
  fixtureType,
  selected,
  onCompetition,
  onValueChange,
}: {
  field: TanStackInputFieldApi<string>
  fixtureType: string
  selected?: { id: number; name: string } | null
  onCompetition: (competition: Competition | null) => void
  onValueChange?: (value: string) => void
}) {
  const { setQuery, debounced } = useDebouncedSearch()
  const competitions = useQuery({
    queryKey: ['fixture-competitions', fixtureType, debounced],
    queryFn: () =>
      getCompetitionsFn({
        data: {
          matchType: fixtureType,
          search: debounced || undefined,
        },
      }),
    enabled: fixtureType.length > 0,
  })
  const selectedMissing =
    field.state.value.length > 0 &&
    !(competitions.data ?? []).some(
      (item) => String(item.id) === field.state.value,
    )
  const selectedLookup = useQuery({
    queryKey: [
      'fixture-competition-selected',
      fixtureType,
      selected?.name,
      field.state.value,
    ],
    queryFn: () =>
      getCompetitionsFn({
        data: {
          matchType: fixtureType,
          search: selected?.name,
        },
      }),
    enabled:
      selectedMissing &&
      debounced.length === 0 &&
      fixtureType.length > 0 &&
      Boolean(selected?.name),
  })

  const rows = useMemo(() => {
    const byId = new Map<number, Competition>()
    for (const item of selectedLookup.data ?? []) byId.set(item.id, item)
    for (const item of competitions.data ?? []) byId.set(item.id, item)
    return [...byId.values()]
  }, [competitions.data, selectedLookup.data])

  useEffect(() => {
    if (!field.state.value) {
      onCompetition(null)
      return
    }
    const match = rows.find((item) => String(item.id) === field.state.value)
    if (match) onCompetition(match)
  }, [rows, field.state.value, onCompetition])

  const options = useMemo(() => {
    const list = rows.map((item) => ({
      value: String(item.id),
      label: item.name,
    }))
    if (
      selected &&
      String(selected.id) === field.state.value &&
      !list.some((item) => item.value === field.state.value)
    ) {
      return [{ value: field.state.value, label: selected.name }, ...list]
    }
    return list
  }, [rows, selected, field.state.value])

  return (
    <ComboboxField
      field={field}
      id="fixture-competition"
      label="Competition"
      required
      placeholder="------"
      searchPlaceholder="Search competitions…"
      emptyMessage={
        debounced && competitions.isFetching
          ? 'Searching…'
          : 'No competitions found'
      }
      options={options}
      disabled={!fixtureType}
      onSearchChange={setQuery}
      onValueChange={onValueChange}
      hint={
        !fixtureType
          ? 'Select a fixture type first.'
          : competitions.error instanceof Error
            ? competitions.error.message
            : undefined
      }
      className="gap-2"
    />
  )
}

function AgentCombobox({
  field,
  initialUsers,
  selected,
  takenIds,
  className,
}: {
  field: TanStackInputFieldApi<string>
  initialUsers: User[]
  selected?: { id: number; name: string }
  takenIds: string[]
  className?: string
}) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const usersQuery = useQuery({
    queryKey: ['fixture-agents', debounced],
    queryFn: () => getUsersFn({ data: { search: debounced } }),
    enabled: debounced.length > 0,
  })

  const source = debounced ? (usersQuery.data?.results ?? []) : initialUsers
  const takenKey = takenIds.join(',')
  const options = useMemo(() => {
    const taken = new Set(takenKey.split(',').filter(Boolean))
    const rows = source
      .filter((user) => {
        const id = String(user.id)
        return id === field.state.value || !taken.has(id)
      })
      .map((user) => ({
        value: String(user.id),
        label: userName(user),
      }))
    if (
      selected &&
      String(selected.id) === field.state.value &&
      selected.name.trim() &&
      !rows.some((user) => user.value === field.state.value)
    ) {
      return [{ value: field.state.value, label: selected.name }, ...rows]
    }
    return rows
  }, [source, field.state.value, takenKey, selected])

  return (
    <ComboboxField
      field={field}
      id={`fixture-agent-${field.name}`}
      label="Agent"
      placeholder="Select an agent"
      searchPlaceholder="Search agents…"
      emptyMessage={
        debounced && usersQuery.isFetching ? 'Searching…' : 'No agents found'
      }
      options={options}
      onSearchChange={setQuery}
      hint={
        usersQuery.error instanceof Error ? usersQuery.error.message : undefined
      }
      className={className}
    />
  )
}

function contextHint(
  label: string,
  ready: boolean,
  items: Array<{ id: number; name: string }> | undefined,
) {
  if (!ready) return 'Select a competition first.'
  if ((items ?? []).length === 0) {
    return `No ${plural(label)} for this competition.`
  }
  return undefined
}

function plural(label: string) {
  const noun = label.toLowerCase()
  if (noun.endsWith('y')) return `${noun.slice(0, -1)}ies`
  return `${noun}s`
}

function namedOptions(items: Array<{ id: number; name: string }> | undefined) {
  return (items ?? []).map((item) => ({
    value: String(item.id),
    label: item.name,
  }))
}

function venueLabel(venue: Venue) {
  const county = venue.county.trim()
  if (!county) return venue.pitchname
  return `${venue.pitchname} (${county})`
}

function typeLabel(type: FixtureType) {
  if (type.sub_type.trim()) {
    return `${type.type_name} (${type.sub_type})`
  }
  return type.type_name
}
