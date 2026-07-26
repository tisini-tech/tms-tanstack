import type {
  FixturePlayerStats,
  FixtureQuarterStats,
  SimpleFixture,
} from '#/lib/types'
import { PDFDownloadLink } from '@react-pdf/renderer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import { DownloadIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PlayerReportPDF } from '../pdf-reports/player/player-report'
import { transformSinglePlayerReportStats } from '../pdf-reports/transform-report-data'
import { ensurePdfPolyfills } from '#/lib/pdf-polyfills'
import {
  calculateYAxisMax,
  generatePlayerPerformanceChart,
  PLAYER_CHART_SIZE_REPORT,
} from '#/lib/charts/generate-player-chart'
import {
  toAverageQuarterStats,
  toPlayerQuarterStat,
} from '#/lib/charts/player-quarter-adapters'

interface PlayerReportDownloadProps {
  fixture: SimpleFixture
  playerStats: FixturePlayerStats[]
  quarterStats: FixtureQuarterStats
}

export const PlayerReportDownload = ({
  fixture,
  playerStats,
  quarterStats,
}: PlayerReportDownloadProps) => {
  const [isClient, setIsClient] = useState(false)
  const [polyfillsReady, setPolyfillsReady] = useState(false)

  const [playerId, setPlayerId] = useState<string>('')
  const [player, setPlayer] = useState<FixturePlayerStats | null>(null)
  const [playerChart, setPlayerChart] = useState<string | null>(null)
  const [isGeneratingChart, setIsGeneratingChart] = useState(false)

  const isHomeTeam = player?.team.team_id === fixture.home_team_id

  const opponetName = isHomeTeam ? fixture.away_team : fixture.home_team
  const playerName = [player?.first_name, player?.sir_name, player?.other_name]
    .filter(Boolean)
    .join(' ')
  const fileName = `${playerName} vs ${opponetName} - ${fixture.match_date.toString()}`

  const teamQuarterStats = useMemo(() => {
    if (!player) {
      return null
    }

    return player.team.team_id === fixture.home_team_id
      ? quarterStats.home
      : quarterStats.away
  }, [fixture.home_team_id, player, quarterStats])

  const playerReportStats = useMemo(() => {
    if (!player) {
      return null
    }

    return transformSinglePlayerReportStats(playerStats, player)
  }, [player, playerStats])

  useEffect(() => {
    let cancelled = false

    void ensurePdfPolyfills().then(() => {
      if (!cancelled) {
        setPolyfillsReady(true)
        setIsClient(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (playerId) {
      const player = playerStats.find(
        (player) => player.id.toString() === playerId,
      )
      setPlayer(player as FixturePlayerStats)
    }
  }, [playerId, playerStats])

  useEffect(() => {
    if (!isClient || !polyfillsReady || !player || !teamQuarterStats) {
      setPlayerChart(null)
      return
    }

    const quarterPlayer = teamQuarterStats.players.find(
      (entry) => entry.player_id === player.id,
    )

    if (!quarterPlayer) {
      setPlayerChart(null)
      return
    }

    let cancelled = false
    setIsGeneratingChart(true)

    const playerStat = toPlayerQuarterStat(quarterPlayer)
    const averageStats = toAverageQuarterStats(teamQuarterStats.average ?? {})
    const teamPlayerStats = teamQuarterStats.players.map(toPlayerQuarterStat)
    const yAxisMax = calculateYAxisMax(teamPlayerStats, averageStats)

    void generatePlayerPerformanceChart(
      playerStat,
      averageStats,
      yAxisMax,
      PLAYER_CHART_SIZE_REPORT,
    )
      .then((chartImage) => {
        if (!cancelled) {
          setPlayerChart(chartImage)
        }
      })
      .catch((error) => {
        console.error('Error generating player chart:', error)
        if (!cancelled) {
          setPlayerChart(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsGeneratingChart(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isClient, polyfillsReady, player, teamQuarterStats])

  if (!isClient || !polyfillsReady) {
    return (
      <Button variant="outline" disabled>
        <DownloadIcon size={16} />
        {playerName} report
      </Button>
    )
  }

  return (
    <div className="flex gap-4">
      <div>
        <Select
          value={playerId}
          onValueChange={(value) => setPlayerId(value ?? '')}
        >
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            {playerStats.map((player) => (
              <SelectItem key={player.id} value={player.id.toString()}>
                {player.first_name} {player.sir_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {player && playerReportStats && (
        <PDFDownloadLink
          document={
            <PlayerReportPDF
              fixture={fixture}
              playerChart={playerChart ?? ''}
              playerName={playerName}
              teamName={player.team.team_name}
              jerseyNumber={player.jersey_number}
              minutesPlayed={player.minutes_played}
              rating={player.rating}
              photoUrl={player.passportphoto || undefined}
              attackingStats={playerReportStats.attacking}
              defensiveStats={playerReportStats.defensive}
              goalkeepingStats={playerReportStats.goalkeeping}
            />
          }
          fileName={fileName}
          style={{ textDecoration: 'none' }}
        >
          {({ loading }) => (
            <Button
              variant="outline"
              disabled={loading || isGeneratingChart || !playerChart}
            >
              <DownloadIcon size={16} />
              {loading ? 'Preparing...' : `${playerName} report`}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  )
}
