import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'

import { InputField } from '#/components/general/forms/input-field'
import { SelectField } from '#/components/general/forms/select-field'
import { UploadFileField } from '#/components/players/upload-file-field'
import { Button } from '#/components/ui/button'
import { FieldGroup } from '#/components/ui/field'
import { createPlayerFn } from '#/data/players'
import { createPlayerSchema, type CreatePlayerSchema } from '#/lib/schemas'
import {
  ID_DOCUMENT_TYPE_OPTIONS,
  type Country,
  type Team,
} from '#/lib/types'

function defaultCountryCode(countries: Country[]) {
  return (
    countries.find((country) => country.iso_code2 === 'KE')?.iso_code2 ??
    countries[0]?.iso_code2 ??
    ''
  )
}

function toOptionalNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

export function CreatePlayerForm({
  team,
  countries,
}: {
  team: Team
  countries: Country[]
}) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [passportphoto, setPassportphoto] = useState('')
  const [idDocument, setIdDocument] = useState('')
  const [uploadingCount, setUploadingCount] = useState(0)

  const backSearch = { teamId: team.id }

  const countryOptions = useMemo(
    () =>
      [...countries]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((country) => ({
          value: country.iso_code2,
          label: `${country.name} (${country.iso_code2})`,
        })),
    [countries],
  )

  function handleUploadingChange(uploading: boolean) {
    setUploadingCount((count) => count + (uploading ? 1 : -1))
  }

  const form = useForm({
    defaultValues: {
      fname: '',
      oname: '',
      sname: '',
      playerdob: '',
      position: '',
      countrycode: defaultCountryCode(countries),
      jersey: '',
      contract: '',
      phone: '',
      idno: '',
      email: '',
      password: '',
      id_document_type: '',
      fifa_id: '',
      preferred_foot: '',
      height: '',
      weight: '',
    } satisfies CreatePlayerSchema,
    validators: {
      onSubmit: createPlayerSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const height = toOptionalNumber(value.height)
      const weight = toOptionalNumber(value.weight)

      try {
        await createPlayerFn({
          data: {
            teamId: String(team.id),
            fname: value.fname.trim(),
            sname: value.sname.trim(),
            oname: value.oname.trim(),
            playerdob: value.playerdob.trim(),
            position: value.position.trim(),
            countrycode: value.countrycode.trim(),
            jersey: value.jersey.trim(),
            contract: value.contract.trim(),
            ...(value.phone.trim() ? { phone: value.phone.trim() } : {}),
            ...(value.idno.trim() ? { idno: value.idno.trim() } : {}),
            ...(value.email.trim() ? { email: value.email.trim() } : {}),
            ...(value.password ? { password: value.password } : {}),
            ...(value.id_document_type
              ? { id_document_type: value.id_document_type }
              : {}),
            ...(idDocument ? { id_document: idDocument } : {}),
            ...(value.fifa_id.trim() ? { fifa_id: value.fifa_id.trim() } : {}),
            ...(value.preferred_foot.trim()
              ? { preferred_foot: value.preferred_foot.trim() }
              : {}),
            ...(height != null ? { height } : {}),
            ...(weight != null ? { weight } : {}),
            ...(passportphoto ? { passportphoto } : {}),
          },
        })
        await router.invalidate()
        await router.navigate({
          to: '/competitions/players',
          search: backSearch,
        })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to create player',
        )
      }
    },
  })

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="space-y-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to="/competitions/players" search={backSearch} />}
        >
          <ArrowLeftIcon className="size-4" data-icon="inline-start" />
          Back to players
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-heading">
          Add player
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a player for {team.name}.
        </p>
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
        <FieldGroup className="gap-5">
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-heading">Identity</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="fname">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-fname"
                    label="First name"
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
                    id="create-player-oname"
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
                    id="create-player-sname"
                    label="Surname"
                    placeholder="Saramu"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="playerdob">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-dob"
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
                    id="create-player-position"
                    label="Position"
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="jersey">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-jersey"
                    label="Jersey"
                    placeholder="10"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="countrycode">
                {(field) => (
                  <SelectField
                    field={field as never}
                    id="create-player-country"
                    label="Country"
                    placeholder="Select country"
                    options={countryOptions}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="contract">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-contract"
                    label="Signed date"
                    type="date"
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
                    id="create-player-foot"
                    label="Preferred foot"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="fifa_id">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-fifa"
                    label="FIFA ID"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="height">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-height"
                    label="Height"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="weight">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-weight"
                    label="Weight"
                    placeholder="Optional"
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="phone">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-phone"
                    label="Phone"
                    type="tel"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="idno">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-idno"
                    label="ID number"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="email">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-email"
                    label="Email"
                    type="email"
                    placeholder="Optional"
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
              <form.Field name="password">
                {(field) => (
                  <InputField
                    field={field}
                    id="create-player-password"
                    label="Password"
                    type="password"
                    placeholder="Optional"
                    autoComplete="new-password"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            </div>

            <form.Field name="id_document_type">
              {(field) => (
                <SelectField
                  field={field as never}
                  id="create-player-doc-type"
                  label="ID document type"
                  placeholder="Select document type"
                  options={ID_DOCUMENT_TYPE_OPTIONS}
                  orientation="vertical"
                  className="gap-2"
                  triggerClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UploadFileField
                id="create-player-passport"
                label="Passport photo"
                value={passportphoto}
                onChange={setPassportphoto}
                onUploadingChange={handleUploadingChange}
                preview="image"
              />
              <UploadFileField
                id="create-player-id-document"
                label="ID document"
                value={idDocument}
                onChange={setIdDocument}
                onUploadingChange={handleUploadingChange}
                preview="document"
              />
            </div>
          </section>

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
              <Link to="/competitions/players" search={backSearch} />
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
                      Creating…
                    </>
                  ) : (
                    'Create player'
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
