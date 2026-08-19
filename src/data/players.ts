import { createServerFn } from '@tanstack/react-start'

import { authFnMiddleware } from '#/middlewares/auth'
import { apiService } from '#/lib/api'
import type { UpdatePlayerSchema } from '#/lib/schemas'
import type { IdDocumentType, Player, TeamPlayer } from '#/lib/types'

export const getPlayersFn = createServerFn({ method: 'GET' })
  .validator((data: { teamId: string }) => data)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const { teamId } = data
    const players = await apiService.get<TeamPlayer[]>(
      `/teams/${teamId}/players`,
    )
    return players
  })

export const deletePlayerFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { teamId: string; playerId: string }) => data)
  .handler(async ({ data }) => {
    const { teamId, playerId } = data
    const response = await apiService.delete<{ message: string }>(
      `/teams/${teamId}/players/${playerId}`,
    )
    return response.message
  })

export type MergePlayerRef = {
  player_id: number
  team_player_id: number
}

export const mergePlayersFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      keeper: MergePlayerRef
      players: MergePlayerRef[]
      preserveTeamPlayer?: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const { keeper, players, preserveTeamPlayer = false } = data

    const payload = {
      keeper_team_player_id: keeper.team_player_id,
      players,
    }

    const query = preserveTeamPlayer ? '?preserve_team_player=true' : ''

    const response = await apiService.post<{ message: string }>(
      `/players/${keeper.player_id}/merge-players${query}`,
      payload,
    )

    return response
  })

export type CreatePlayerBody = {
  fname: string
  sname: string
  oname: string
  playerdob: string
  position: string
  countrycode: string
  jersey: string
  contract: string
  phone?: string
  idno?: string
  email?: string
  password?: string
  id_document_type?: IdDocumentType
  id_document?: string
  fifa_id?: string
  preferred_foot?: string
  height?: number
  weight?: number
  passportphoto?: string
}

export type CreatePlayerPayload = {
  teamId: string
} & CreatePlayerBody

export const createPlayerFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: CreatePlayerPayload) => data)
  .handler(async ({ data }) => {
    const { teamId, ...player } = data

    return apiService.post<Player | { message: string }>(
      `/teams/${teamId}/players`,
      player,
    )
  })

/** Body fields the PATCH endpoint accepts — all optional. */
export type UpdatePlayerBody = {
  fname?: string
  sname?: string
  oname?: string
  playerdob?: string
  position?: string
  phone?: string
  idno?: string
  country?: number | null
  jersey?: string
  contract?: string
  email?: string
  id_document_type?: IdDocumentType | ''
  id_document?: string
  id_no?: string
  passportphoto?: string
  nationality?: string
  fifa_id?: string
  preferred_foot?: string
  height?: string
  weight?: string
}

export type UpdatePlayerPayload = {
  team: number
  id: number
  patch: UpdatePlayerBody
}

type PlayerSnapshot = UpdatePlayerSchema & {
  passportphoto: string
  id_document: string
}

function normalizeCountry(value: string) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Compare current form state to the values loaded when the modal opened. */
export function getPlayerPatch(
  current: PlayerSnapshot,
  initial: PlayerSnapshot,
): UpdatePlayerBody {
  const patch: UpdatePlayerBody = {}

  const setIfChanged = <K extends keyof UpdatePlayerBody>(
    key: K,
    next: UpdatePlayerBody[K],
    prev: UpdatePlayerBody[K],
  ) => {
    if (next !== prev) patch[key] = next
  }

  setIfChanged('fname', current.fname.trim(), initial.fname.trim())
  setIfChanged('sname', current.sname.trim(), initial.sname.trim())
  setIfChanged('oname', current.oname.trim(), initial.oname.trim())
  setIfChanged('playerdob', current.playerdob.trim(), initial.playerdob.trim())
  setIfChanged('position', current.position.trim(), initial.position.trim())
  setIfChanged('phone', current.phone.trim(), initial.phone.trim())
  setIfChanged('jersey', current.jersey.trim(), initial.jersey.trim())
  setIfChanged('contract', current.contract.trim(), initial.contract.trim())
  setIfChanged('email', current.email.trim(), initial.email.trim())
  setIfChanged(
    'id_document_type',
    current.id_document_type,
    initial.id_document_type,
  )
  setIfChanged(
    'nationality',
    current.nationality.trim(),
    initial.nationality.trim(),
  )
  setIfChanged('fifa_id', current.fifa_id.trim(), initial.fifa_id.trim())
  setIfChanged(
    'preferred_foot',
    current.preferred_foot.trim(),
    initial.preferred_foot.trim(),
  )
  setIfChanged('height', current.height.trim(), initial.height.trim())
  setIfChanged('weight', current.weight.trim(), initial.weight.trim())
  setIfChanged('passportphoto', current.passportphoto, initial.passportphoto)
  setIfChanged('id_document', current.id_document, initial.id_document)

  const nextId = current.id_no.trim()
  const prevId = initial.id_no.trim()
  if (nextId !== prevId) {
    patch.id_no = nextId
    patch.idno = nextId
  }

  const nextCountry = normalizeCountry(current.country)
  const prevCountry = normalizeCountry(initial.country)
  if (nextCountry !== prevCountry) {
    patch.country = nextCountry
  }

  return patch
}

export const updatePlayerFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: UpdatePlayerPayload) => data)
  .handler(async ({ data }) => {
    const { team, id, patch } = data
    if (Object.keys(patch).length === 0) {
      return null
    }
    return apiService.patch<Player>(`/teams/${team}/players/${id}`, patch)
  })
