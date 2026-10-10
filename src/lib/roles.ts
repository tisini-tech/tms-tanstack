export const appRoles = [
  {
    id: 1,
    name: 'Admin',
  },
  {
    id: 7,
    name: 'Super Agent',
  },
  {
    id: 26,
    name: 'Agent',
  },
  {
    id: 23,
    name: 'Competition Manager',
  },
  {
    id: 24,
    name: 'Editor',
  },
  {
    id: 2,
    name: 'Team Manager',
  },
  {
    id: 5,
    name: 'Player',
  },
  {
    id: 9,
    name: 'Referee',
  },
]

/** Admin, super agent, and competition manager can download both teams. */
const BOTH_REPORT_ROLE_IDS = new Set(['1', '7', '23'])

export function reportSidesForRole(input: {
  role: string | number | null | undefined
  userId?: number
  teamIds: number[]
  homeTeamId: number
  awayTeamId: number
  homeAgentId?: number
  awayAgentId?: number
}): Array<'home' | 'away'> {
  const role = String(input.role ?? '')
  const sides = [
    { side: 'home' as const, teamId: input.homeTeamId, agentId: input.homeAgentId },
    { side: 'away' as const, teamId: input.awayTeamId, agentId: input.awayAgentId },
  ]

  if (BOTH_REPORT_ROLE_IDS.has(role)) {
    return ['home', 'away']
  }

  if (role === '2') {
    return sides
      .filter((entry) => input.teamIds.includes(entry.teamId))
      .map((entry) => entry.side)
  }

  if (role === '26') {
    return sides
      .filter(
        (entry) => input.userId != null && entry.agentId === input.userId,
      )
      .map((entry) => entry.side)
  }

  return []
}
