import { useEffect, useState } from 'react'

import type { Team } from '#/lib/types'
import { getInitials } from '#/lib/utils'
import SearchBar from '#/components/general/search'
import { createFileRoute } from '@tanstack/react-router'
import { getTeamsFn, searchTeamsFn } from '#/data/teams'
import { EditTeamModal } from '#/components/teams/edit-team'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

export const Route = createFileRoute('/_dashboard/competitions/teams/')({
  loader: async () => {
    const teamData = await getTeamsFn()
    return { teamData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { teamData } = Route.useLoaderData()

  const [teams, setTeams] = useState<Team[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchClick = async () => {
    setIsLoading(true)
    const response = await searchTeamsFn({
      data: { search },
    })

    setTeams(response)
    setIsLoading(false)
  }

  useEffect(() => {
    if (teamData) {
      setTeams(teamData)
    }
  }, [teamData])

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        search={search}
        handleSearch={handleSearch}
        handleSearchClick={handleSearchClick}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const hasLogo = Boolean(team.teamlogo)

          return (
            <div
              key={team.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Avatar size="lg" className="size-12 rounded-lg after:rounded-lg">
                {hasLogo ? (
                  <AvatarImage
                    src={team.teamlogo}
                    alt={team.name}
                    className="rounded-lg"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg text-xs font-medium">
                  {getInitials(team.name) || 'TM'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{team.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {team.team_type.name}
                </p>
              </div>

              <EditTeamModal team={team} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
