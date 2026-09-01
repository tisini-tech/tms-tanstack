import type { Player } from '#/lib/types'

/** Player has passport photo and ID document on file (roster registration). */
export function isPlayerFullyRegistered(player: Player) {
  return Boolean(
    player.passportphoto?.trim() && player.id_document?.trim(),
  )
}
