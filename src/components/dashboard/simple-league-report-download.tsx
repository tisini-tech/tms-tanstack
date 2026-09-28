import { DownloadIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

import { Button } from '#/components/ui/button'
import { ensurePdfPolyfills } from '#/lib/pdf-polyfills'
import { GenSimpleLeaguePDF } from '#/components/pdf-reports/dash/simple-league-dash'
import { buildLeagueReport } from '#/components/dashboard/league-dash'
import type { LeagueDashboard } from '#/lib/types'

export function SimpleLeagueReportDownload({
  dashboard,
  tournamentName,
  seasonName,
}: {
  dashboard: LeagueDashboard
  tournamentName?: string
  seasonName?: string
}) {
  const [ready, setReady] = useState(false)
  const report = useMemo(() => buildLeagueReport(dashboard), [dashboard])

  useEffect(() => {
    let cancelled = false
    void ensurePdfPolyfills().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const fileName = `${(tournamentName || 'league').replace(/\s+/g, '_')}_report.pdf`

  if (!ready) {
    return (
      <Button variant="outline" disabled>
        <DownloadIcon />
        Download PDF
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={
        <GenSimpleLeaguePDF
          tableData={report.tableData}
          teamNames={report.teamNames}
          teamGamesCount={report.teamGamesCount}
          displayMode="total"
          tournamentName={tournamentName}
          seasonName={seasonName}
          numberOfTeams={report.numberOfTeams}
          gamesPlayed={report.gamesPlayed}
        />
      }
      fileName={fileName}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          <DownloadIcon />
          {loading ? 'Generating...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
