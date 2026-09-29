import { type FC } from 'react'
import { Table, TD, TH, TR } from '@ag-media/react-pdf-table'
import { Document, StyleSheet, Text, View } from '@react-pdf/renderer'

import { BrandPage } from '#/components/pdf-reports/brand-page'

export type SimpleTeamSeasonKpis = {
  games: number
  seqAverage: number
  seqTotal: number
  seqPointsTotal: number
  seqPointsAvg: number
  shotOn: number
  shotTotal: number
  fouls: number
}

export type SimpleTeamMatchOverview = {
  label: string
  matchDate?: string
  below3: number
  btwn4to6: number
  btwn7to9: number
  over10: number
  seqTotal: number
  seqAverage: number
  seqPoints: number
  shotOn: number
  shotTotal: number
  facedOn: number
  facedTotal: number
  fouls: number
  foulThrows: number
}

export type GenSimpleTeamPDFProps = {
  teamName: string
  competitionName?: string
  season: SimpleTeamSeasonKpis
  matches: SimpleTeamMatchOverview[]
}

const weightings = [
  0.15, // opponent
  0.06, // below3
  0.06, // 4-6
  0.06, // 7-9
  0.06, // 10+
  0.14, // seq (pts · tot · avg)
  0.13, // attempts
  0.14, // attempts faced
  0.07, // fouls
  0.07, // throwin
]

export const GenSimpleTeamPDF: FC<GenSimpleTeamPDFProps> = ({
  teamName,
  competitionName,
  season,
  matches,
}) => {
  const headerTitle = [teamName || 'Team', competitionName]
    .filter(Boolean)
    .join(' | ')
  const shotPct = percent(season.shotTotal, season.shotOn)
  const foulsAvg = Math.round(season.fouls / Math.max(season.games, 1))

  return (
    <Document>
      <BrandPage
        isLandscape
        headerTitle={headerTitle}
        isPageNumber={false}
        footerLabel="Team Dashboard"
        dense
      >
        <View style={styles.content}>
          <View style={styles.kpiRow} wrap={false}>
            <KpiCard
              label="Games"
              value={String(season.games)}
              hint="In this view"
            />
            <KpiCard
              label="Seq. average"
              value={formatNumber(season.seqAverage, true)}
              hint={`${season.seqTotal} sequences`}
            />
            <KpiCard
              label="Seq. points"
              value={String(season.seqPointsTotal)}
              hint={`avg ${formatNumber(season.seqPointsAvg, true)} / game`}
            />
            <KpiCard
              label="Shot on target"
              value={`${shotPct}%`}
              hint={`${season.shotOn}/${season.shotTotal}`}
            />
            <KpiCard
              label="Fouls"
              value={String(season.fouls)}
              hint={`avg ${foulsAvg} / game`}
            />
          </View>

          <View style={styles.tableContainer}>
          <Table
            style={styles.table}
            tdStyle={styles.cell}
            weightings={weightings}
          >
            <TH>
              <TD style={styles.thLeft}>Opponent</TD>
              <TD style={styles.th}>Below 3</TD>
              <TD style={styles.th}>4–6</TD>
              <TD style={styles.th}>7–9</TD>
              <TD style={styles.th}>10+</TD>
              <TD style={styles.th}>Seq</TD>
              <TD style={styles.th}>Attempts</TD>
              <TD style={styles.th}>Faced</TD>
              <TD style={styles.th}>Fouls</TD>
              <TD style={styles.th}>Throw-in</TD>
            </TH>
            {matches.map((match, index) => {
              const attempts = `${match.shotOn}/${match.shotTotal} (${percent(match.shotTotal, match.shotOn)}%)`
              const faced = `${match.facedOn}/${match.facedTotal} (${percent(match.facedTotal, match.facedOn)}%)`
              const rowStyle = index % 2 === 1 ? styles.tdAlt : styles.td

              return (
                <TR key={match.label}>
                  <TD style={styles.tdOpponent}>
                    <Text style={styles.opponentName}>{match.label}</Text>
                    {match.matchDate ? (
                      <Text style={styles.opponentDate}>{match.matchDate}</Text>
                    ) : null}
                  </TD>
                  <TD style={rowStyle}>{match.below3}</TD>
                  <TD style={rowStyle}>{match.btwn4to6}</TD>
                  <TD style={rowStyle}>{match.btwn7to9}</TD>
                  <TD style={rowStyle}>{match.over10}</TD>
                  <TD style={styles.tdSeq}>
                    <Text style={styles.seqPts}>{match.seqPoints} pts</Text>
                    <Text style={styles.seqMeta}>
                      {match.seqTotal} tot · avg{' '}
                      {formatNumber(match.seqAverage, true)}
                    </Text>
                  </TD>
                  <TD style={rowStyle}>{attempts}</TD>
                  <TD style={rowStyle}>{faced}</TD>
                  <TD style={rowStyle}>{match.fouls}</TD>
                  <TD style={rowStyle}>{match.foulThrows}</TD>
                </TR>
              )
            })}
          </Table>
          </View>
        </View>
      </BrandPage>
    </Document>
  )
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiHint}>{hint}</Text>
    </View>
  )
}

function percent(total: number, part: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function formatNumber(value: number, decimal: boolean) {
  if (!decimal) return String(Math.round(value))
  return String(Math.round(value * 10) / 10)
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
  },
  kpiLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  kpiValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  kpiHint: {
    marginTop: 2,
    fontSize: 7,
    color: '#64748b',
  },
  tableContainer: {
    flexGrow: 1,
  },
  table: {
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  cell: {
    paddingVertical: 7,
    paddingHorizontal: 4,
    fontSize: 9,
  },
  th: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  thLeft: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'left',
  },
  td: {
    paddingVertical: 7,
    paddingHorizontal: 3,
    fontSize: 9,
    textAlign: 'center',
    color: '#1e293b',
  },
  tdAlt: {
    paddingVertical: 7,
    paddingHorizontal: 3,
    fontSize: 9,
    textAlign: 'center',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  tdOpponent: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  opponentName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'left',
  },
  opponentDate: {
    marginTop: 1,
    fontSize: 7,
    color: '#64748b',
    textAlign: 'left',
  },
  tdSeq: {
    paddingVertical: 5,
    paddingHorizontal: 3,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqPts: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  seqMeta: {
    marginTop: 1,
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
  },
})
