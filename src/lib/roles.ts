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
    id: 25,
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

function sameId(left: number | undefined, right: number | undefined) {
  if (left == null || right == null) return false
  const a = Number(left)
  const b = Number(right)
  return Number.isFinite(a) && a === b
}

/** Session stores "first last"; the fixture agent name also includes the sir name. */
function coveredByName(agentName: string | undefined, userName: string | undefined) {
  const agent = agentName?.trim().toLowerCase()
  const user = userName?.trim().toLowerCase()
  if (!agent || !user) return false
  return agent === user || agent.startsWith(`${user} `)
}

export function reportSidesForRole(input: {
  role: string | number | null | undefined
  userId?: number
  userName?: string
  teamIds: number[]
  homeTeamId: number
  awayTeamId: number
  homeAgentId?: number
  awayAgentId?: number
  homeAgentName?: string
  awayAgentName?: string
}): Array<'home' | 'away'> {
  const role = String(input.role ?? '').toLowerCase()
  const sides = [
    {
      side: 'home' as const,
      teamId: input.homeTeamId,
      agentId: input.homeAgentId,
      agentName: input.homeAgentName,
    },
    {
      side: 'away' as const,
      teamId: input.awayTeamId,
      agentId: input.awayAgentId,
      agentName: input.awayAgentName,
    },
  ]

  if (BOTH_REPORT_ROLE_IDS.has(role)) {
    return ['home', 'away']
  }

  if (role === '2') {
    return sides
      .filter((entry) => input.teamIds.includes(entry.teamId))
      .map((entry) => entry.side)
  }

  // Agent (26) and editor (25). 24 is kept so an older editor id still matches.
  if (role === 'editor' || ['24', '25', '26'].includes(role)) {
    return sides
      .filter(
        (entry) =>
          sameId(entry.agentId, input.userId) ||
          coveredByName(entry.agentName, input.userName),
      )
      .map((entry) => entry.side)
  }

  return []
}
