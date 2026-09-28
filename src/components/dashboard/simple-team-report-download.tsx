import { DownloadIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

import { Button } from '#/components/ui/button'
import { ensurePdfPolyfills } from '#/lib/pdf-polyfills'
import { GenSimpleTeamPDF } from '#/components/pdf-reports/dash/simple-team-dash'
import {
  buildSimpleTeamReport,
  type SimpleTeamResult,
} from '#/components/dashboard/team-dash'
import type {
  DashboardMatch,
  DashboardSequences,
  DashboardTeamStats,
} from '#/lib/types'

export function SimpleTeamReportDownload({
  teamName,
  matches,
  teamStats,
  sequences,
  opponentStats,
}: {
  teamName: string
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  sequences: DashboardSequences | null
  opponentStats: DashboardTeamStats[] | DashboardTeamStats | null
}) {
  const [ready, setReady] = useState(false)
  const report = useMemo(
    () =>
      buildSimpleTeamReport({
        matches,
        teamStats,
        sequences,
        opponentStats,
      }),
    [matches, opponentStats, sequences, teamStats],
  )

  useEffect(() => {
    let cancelled = false
    void ensurePdfPolyfills().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const fileName = `${teamName.replace(/\s+/g, '_') || 'team'}_report.pdf`

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
        <GenSimpleTeamPDF
          tableData={
            report.tableData as Record<string, Record<string, SimpleTeamResult>>
          }
          teamName={teamName}
          numberOfGames={report.numberOfGames}
          opponents={report.opponents}
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
