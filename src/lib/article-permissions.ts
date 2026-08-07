/** Roles allowed to publish / reject articles. */
export const ARTICLE_MODERATOR_ROLE_IDS = new Set([1, 7, 25])

export function canModerateArticles(
  role: string | number | null | undefined,
): boolean {
  const id = Number(role)
  return Number.isFinite(id) && ARTICLE_MODERATOR_ROLE_IDS.has(id)
}
