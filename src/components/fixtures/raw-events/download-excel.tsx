import { DownloadIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { RawFixtureEvent } from '#/lib/types'

const HEADERS = [
  'ID',
  'Match',
  'Home',
  'Away',
  'Event',
  'Sub Event',
  'Sub Sub Event',
  'Player',
  'Player Position',
  'Sub Player',
  'Agent',
  'Team',
  'Minute',
  'Second',
  'Moment',
  'Narration',
  'Quarter',
  'Kick From',
  'Kick Landing Zone',
  'Meters Made',
  'Players In Ruck',
  'Players Lineout',
  'Defender Beaten',
  'Zone ID',
  'Video Time',
  'App Time Log',
  'Created At',
] as const

type Header = (typeof HEADERS)[number]

type DownloadRawExcelProps = {
  events: RawFixtureEvent[]
  homeTeam: string
  awayTeam: string
  homeTeamId: number
  awayTeamId: number
}

function teamName(
  teamId: number,
  homeTeam: string,
  awayTeam: string,
  homeTeamId: number,
  awayTeamId: number,
) {
  if (teamId === homeTeamId) return homeTeam
  if (teamId === awayTeamId) return awayTeam
  return String(teamId)
}

function fileName(homeTeam: string, awayTeam: string) {
  const safe = `${homeTeam} vs ${awayTeam}`
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
  return `${safe || 'match-events'}.xlsx`
}

function eventRow(
  event: RawFixtureEvent,
  homeTeam: string,
  awayTeam: string,
  homeTeamId: number,
  awayTeamId: number,
): Record<Header, string | number> {
  return {
    ID: event.id,
    Match: event.match,
    Home: homeTeam,
    Away: awayTeam,
    Event: event.metric?.name ?? '',
    'Sub Event': event.metric_detail?.name ?? '',
    'Sub Sub Event': event.metric_sub_detail?.name ?? '',
    Player: event.player?.name ?? '',
    'Player Position': event.player?.current_position ?? '',
    'Sub Player': event.subplayer?.name ?? '',
    Agent: event.agent?.name ?? '',
    Team: teamName(event.team, homeTeam, awayTeam, homeTeamId, awayTeamId),
    Minute: event.minute,
    Second: event.second,
    Moment: event.moment ?? '',
    Narration: event.narration ?? '',
    Quarter: event.quarter ?? '',
    'Kick From': event.kickfrom ?? '',
    'Kick Landing Zone': event.kickland ?? '',
    'Meters Made': event.meter_gain ?? '',
    'Players In Ruck': event.no_ruck ?? '',
    'Players Lineout': event.no_lineout ?? '',
    'Defender Beaten': event.defender ?? '',
    'Zone ID': event.zone_id ?? '',
    'Video Time': event.video_timestamp ?? '',
    'App Time Log': event.app_timelog ?? '',
    'Created At': event.created_at ?? '',
  }
}

export default function DownloadRawExcel({
  events,
  homeTeam,
  awayTeam,
  homeTeamId,
  awayTeamId,
}: DownloadRawExcelProps) {
  async function handleDownload() {
    const XLSX = await import('xlsx')
    const rows = events.map((event) => {
      const row = eventRow(event, homeTeam, awayTeam, homeTeamId, awayTeamId)
      return HEADERS.map((header) => row[header])
    })
    const sheet = XLSX.utils.aoa_to_sheet([[...HEADERS], ...rows])
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, 'Events')
    XLSX.writeFile(book, fileName(homeTeam, awayTeam))
  }

  return (
    <Button variant="outline" size="sm" type="button" onClick={handleDownload}>
      <DownloadIcon className="size-4" data-icon="inline-start" />
      Download
    </Button>
  )
}
