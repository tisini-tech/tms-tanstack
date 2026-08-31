import { useForm } from '@tanstack/react-form'
import { useMemo, useRef, useState } from 'react'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import { Link, useParams, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { FieldGroup } from '#/components/ui/field'
import { getPlayerPatch, updatePlayerFn } from '#/data/players'
import { InputField } from '#/components/general/forms/input-field'
import { SelectField } from '#/components/general/forms/select-field'
import { playerToFormValues, updatePlayerSchema } from '#/lib/schemas'
import { UploadFileField } from '#/components/players/upload-file-field'
import {
  ID_DOCUMENT_TYPE_OPTIONS,
  type Country,
  type TeamPlayer,
} from '#/lib/types'

export function EditPlayerForm({
  entry,
  countries,
  seasonId,
  backSearch,
}: {
  entry: TeamPlayer
  countries: Country[]
  seasonId?: number
  backSearch: {
    teamId: number
    teamName?: string
    seasonId?: number
    divisionId?: number
    categoryId?: number
  }
}) {
  const router = useRouter()
  const { compId } = useParams({ strict: false }) as { compId?: string }
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [passportphoto, setPassportphoto] = useState(
    entry.player.passportphoto ?? '',
  )
  const [idDocument, setIdDocument] = useState(entry.player.id_document ?? '')
  const [frontImg, setFrontImg] = useState(entry.front_img ?? '')
  const [sideImg, setSideImg] = useState(entry.side_img ?? '')
  const [actionImg, setActionImg] = useState(entry.action_img ?? '')
  const [uploadingCount, setUploadingCount] = useState(0)
  const canEditSeasonImages = entry.season_player_id != null && seasonId != null
  const initialRef = useRef({
    ...playerToFormValues(entry.player, entry),
    passportphoto: entry.player.passportphoto ?? '',
    id_document: entry.player.id_document ?? '',
    front_img: entry.front_img ?? '',
    side_img: entry.side_img ?? '',
    action_img: entry.action_img ?? '',
  })

  const countryOptions = useMemo(
    () =>
      [...countries]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((country) => ({
          value: String(country.id),
          label: country.name,
        })),
    [countries],
  )

  function handleUploadingChange(uploading: boolean) {
    setUploadingCount((count) => count + (uploading ? 1 : -1))
  }

  const player = entry.player

  const form = useForm({
    defaultValues: playerToFormValues(player, entry),
    validators: {
      onSubmit: updatePlayerSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const patch = getPlayerPatch(
        {
          ...value,
          passportphoto,
          id_document: idDocument,
        },
        initialRef.current,
      )

      if (canEditSeasonImages && seasonId != null) {
        const seasonChanged =
          frontImg !== initialRef.current.front_img ||
          sideImg !== initialRef.current.side_img ||
          actionImg !== initialRef.current.action_img

        if (seasonChanged) {
          patch.season_id = seasonId
          if (frontImg !== initialRef.current.front_img) {
            patch.front_img = frontImg
          }
          if (sideImg !== initialRef.current.side_img) {
            patch.side_img = sideImg
          }
          if (actionImg !== initialRef.current.action_img) {
            patch.action_img = actionImg
          }
        }
      }

      if (Object.keys(patch).length === 0) {
        await router.navigate({
          to: '/competitions/$compId/players',
          params: { compId: compId ?? '' },
          search: backSearch,
        })
        return
      }

      try {
        await updatePlayerFn({
          data: {
            team: entry.team,
            id: entry.id,
            patch,
          },
        })
        await router.invalidate()
        await router.navigate({
          to: '/competitions/$compId/players',
          params: { compId: compId ?? '' },
          search: backSearch,
        })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to update player',
        )
      }
    },
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/competitions/$compId/players"
                params={{ compId: compId ?? '' }}
                search={backSearch}
              />
            }
          >
            <ArrowLeftIcon className="size-4" data-icon="inline-start" />
            Back to players
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Edit player
          </h1>
          <p className="text-sm text-muted-foreground">
            Update details for {player.name || 'this player'}. Fields marked
            with <span className="text-destructive">*</span> are required.
          </p>
        </div>
      </div>

      <form
        className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-8"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-6">
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-heading">Identity</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <form.Field name="fname">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-fname`}
                    label="First name"
                    required
                    placeholder="Charles"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="oname">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-oname`}
                    label="Other name"
                    placeholder="Momanyi"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="sname">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-sname`}
                    label="Surname"
                    required
                    placeholder="Saramu"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="playerdob">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-dob`}
                    label="Date of birth"
                    type="date"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="position">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-position`}
                    label="Position"
                    required
                    placeholder="Forward"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-heading">Squad details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <form.Field name="jersey">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-jersey`}
                    label="Jersey"
                    placeholder="10"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="nationality">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-nationality`}
                    label="Nationality"
                    placeholder="Kenyan"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="preferred_foot">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-foot`}
                    label="Preferred foot"
                    placeholder="Right"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="fifa_id">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-fifa`}
                    label="FIFA ID"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="country">
                {(field) => (
                  <SelectField
                    field={field as never}
                    id={`player-${player.id}-country`}
                    label="Country"
                    placeholder="Select country"
                    options={countryOptions}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="contract">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-contract`}
                    label="Signed date"
                    type="date"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-heading">Contact & ID</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <form.Field name="id_no">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-id-no`}
                    label="ID number"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="id_document_type">
                {(field) => (
                  <SelectField
                    field={field as never}
                    id={`player-${player.id}-doc-type`}
                    label="ID document type"
                    placeholder="Select document type"
                    options={ID_DOCUMENT_TYPE_OPTIONS}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-phone`}
                    label="Phone"
                    type="tel"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="email">
                {(field) => (
                  <InputField
                    field={field}
                    id={`player-${player.id}-email`}
                    label="Email"
                    type="email"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <UploadFileField
                id={`player-${player.id}-passport`}
                label="Passport photo"
                value={passportphoto}
                onChange={setPassportphoto}
                onUploadingChange={handleUploadingChange}
                preview="image"
              />
              <UploadFileField
                id={`player-${player.id}-id-document`}
                label="ID document"
                value={idDocument}
                onChange={setIdDocument}
                onUploadingChange={handleUploadingChange}
                preview="document"
              />
            </div>
          </section>

          {canEditSeasonImages ? (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-medium text-heading">
                  Season photos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Images for the selected season registration.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <UploadFileField
                  id={`player-${player.id}-front`}
                  label="Front image"
                  value={frontImg}
                  onChange={setFrontImg}
                  onUploadingChange={handleUploadingChange}
                />
                <UploadFileField
                  id={`player-${player.id}-side`}
                  label="Side image"
                  value={sideImg}
                  onChange={setSideImg}
                  onUploadingChange={handleUploadingChange}
                />
                <UploadFileField
                  id={`player-${player.id}-action`}
                  label="Action image"
                  value={actionImg}
                  onChange={setActionImg}
                  onUploadingChange={handleUploadingChange}
                />
              </div>
            </section>
          ) : null}

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
        </FieldGroup>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={
              <Link
                to="/competitions/$compId/players"
                params={{ compId: compId ?? '' }}
                search={backSearch}
              />
            }
          >
            Cancel
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => {
              const busy = isSubmitting || uploadingCount > 0
              return (
                <Button type="submit" disabled={busy}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                      Saving…
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              )
            }}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}
