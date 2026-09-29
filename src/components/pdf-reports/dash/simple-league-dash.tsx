import { type FC } from 'react'
import { Table, TD, TH, TR } from '@ag-media/react-pdf-table'
import { Document, StyleSheet, Text, View } from '@react-pdf/renderer'

import { BrandPage } from '#/components/pdf-reports/brand-page'

export type SimpleLeagueSeasonKpis = {
  teams: number
  gamesMax: number
  seqAverage: number
  seqTotal: number
  seqPointsTotal: number
  seqPointsAvg: number
  shotOn: number
  shotTotal: number
  fouls: number
}

export type SimpleLeagueTeamRow = {
  name: string
  games: number
  below3: number
  btwn4to6: number
  btwn7to9: number
  over10: number
  seqTotal: number
  seqAverage: number
  seqPoints: number
  shotOn: number
  shotTotal: number
  fouls: number
  foulThrows: number
}

export type LeaguePDFProps = {
  title?: string
  season: SimpleLeagueSeasonKpis
  teams: SimpleLeagueTeamRow[]
}

const weightings = [
  0.14, // team
  0.04, // G
  0.06, // below3
  0.05, // 4-6
  0.05, // 7-9
  0.05, // 10+
  0.11, // seq
  0.08, // seq pts
  0.14, // attempts
  0.09, // fouls
  0.09, // throwin
]

export const GenSimpleLeaguePDF: FC<LeaguePDFProps> = ({
  title,
  season,
  teams,
}) => {
  const shotPct = percent(season.shotTotal, season.shotOn)
  const averages = averageRow(teams)
  const headerTitle = title || 'League Dashboard'

  return (
    <Document>
      <BrandPage
        isLandscape
        headerTitle={headerTitle}
        isPageNumber={false}
        footerLabel="League Dashboard"
        dense
      >
        <View style={styles.content}>
          <View style={styles.kpiRow} wrap={false}>
            <KpiCard
              label="Teams"
              value={String(season.teams)}
              hint={`${season.gamesMax} games (max)`}
            />
            <KpiCard
              label="Seq. average"
              value={formatNumber(season.seqAverage, true)}
              hint={`${season.seqTotal} sequences`}
            />
            <KpiCard
              label="Seq. points"
              value={String(season.seqPointsTotal)}
              hint={`avg ${formatNumber(season.seqPointsAvg, true)} / team`}
            />
            <KpiCard
              label="Shot on target"
              value={`${shotPct}%`}
              hint={`${season.shotOn}/${season.shotTotal}`}
            />
            <KpiCard
              label="Fouls"
              value={String(season.fouls)}
              hint={`avg ${Math.round(season.fouls / Math.max(season.teams, 1))} / team`}
            />
          </View>

          <View style={styles.tableContainer}>
            <Table
              style={styles.table}
              tdStyle={styles.cell}
              weightings={weightings}
            >
              <TH>
                <TD style={styles.thLeft}>Team</TD>
                <TD style={styles.th}>G</TD>
                <TD style={styles.th}>Below 3</TD>
                <TD style={styles.th}>4–6</TD>
                <TD style={styles.th}>7–9</TD>
                <TD style={styles.th}>10+</TD>
                <TD style={styles.th}>Seq</TD>
                <TD style={styles.th}>Seq pts</TD>
                <TD style={styles.th}>Attempts</TD>
                <TD style={styles.th}>Fouls</TD>
                <TD style={styles.th}>Throw-in</TD>
              </TH>
              {teams.map((team, index) => {
                const rowStyle = index % 2 === 1 ? styles.tdAlt : styles.td
                const attempts = `${team.shotOn}/${team.shotTotal} (${percent(team.shotTotal, team.shotOn)}%)`
                return (
                  <TR key={team.name}>
                    <TD style={styles.tdTeam}>
                      <Text style={styles.teamName}>{team.name}</Text>
                    </TD>
                    <TD style={rowStyle}>{team.games}</TD>
                    <TD style={rowStyle}>{team.below3}</TD>
                    <TD style={rowStyle}>{team.btwn4to6}</TD>
                    <TD style={rowStyle}>{team.btwn7to9}</TD>
                    <TD style={rowStyle}>{team.over10}</TD>
                    <TD style={styles.tdStack}>
                      <Text style={styles.stackMain}>{team.seqTotal} tot</Text>
                      <Text style={styles.stackMeta}>
                        avg {formatNumber(team.seqAverage, true)}
                      </Text>
                    </TD>
                    <TD style={styles.tdStack}>
                      <Text style={styles.stackMain}>{team.seqPoints}</Text>
                      <Text style={styles.stackMeta}>
                        avg{' '}
                        {formatNumber(
                          team.games > 0 ? team.seqPoints / team.games : 0,
                          true,
                        )}
                      </Text>
                    </TD>
                    <TD style={rowStyle}>{attempts}</TD>
                    <TD style={styles.tdStack}>
                      <Text style={styles.stackMain}>{team.fouls}</Text>
                      <Text style={styles.stackMeta}>
                        avg{' '}
                        {formatNumber(
                          team.games > 0 ? team.fouls / team.games : 0,
                          true,
                        )}
                      </Text>
                    </TD>
                    <TD style={styles.tdStack}>
                      <Text style={styles.stackMain}>{team.foulThrows}</Text>
                      <Text style={styles.stackMeta}>
                        avg{' '}
                        {formatNumber(
                          team.games > 0 ? team.foulThrows / team.games : 0,
                          true,
                        )}
                      </Text>
                    </TD>
                  </TR>
                )
              })}
              <TR>
                <TD style={styles.tdAvgLabel}>
                  <Text style={styles.avgLabel}>Avg</Text>
                </TD>
                <TD style={styles.tdAvg}>
                  {formatNumber(averages.games, true)}
                </TD>
                <TD style={styles.tdAvg}>
                  {formatNumber(averages.below3, true)}
                </TD>
                <TD style={styles.tdAvg}>
                  {formatNumber(averages.btwn4to6, true)}
                </TD>
                <TD style={styles.tdAvg}>
                  {formatNumber(averages.btwn7to9, true)}
                </TD>
                <TD style={styles.tdAvg}>
                  {formatNumber(averages.over10, true)}
                </TD>
                <TD style={styles.tdAvgStack}>
                  <Text style={styles.stackMain}>
                    {formatNumber(averages.seqTotal, true)} tot
                  </Text>
                  <Text style={styles.stackMeta}>
                    avg {formatNumber(averages.seqAverage, true)}
                  </Text>
                </TD>
                <TD style={styles.tdAvgStack}>
                  <Text style={styles.stackMain}>
                    {formatNumber(averages.seqPoints, true)}
                  </Text>
                  <Text style={styles.stackMeta}>
                    avg {formatNumber(averages.seqPointsPerGame, true)}
                  </Text>
                </TD>
                <TD style={styles.tdAvg}>
                  {formatNumber(averages.shotOn, true)}/
                  {formatNumber(averages.shotTotal, true)} (
                  {percent(averages.shotTotal, averages.shotOn)}%)
                </TD>
                <TD style={styles.tdAvgStack}>
                  <Text style={styles.stackMain}>
                    {formatNumber(averages.fouls, true)}
                  </Text>
                  <Text style={styles.stackMeta}>
                    avg {formatNumber(averages.foulsPerGame, true)}
                  </Text>
                </TD>
                <TD style={styles.tdAvgStack}>
                  <Text style={styles.stackMain}>
                    {formatNumber(averages.foulThrows, true)}
                  </Text>
                  <Text style={styles.stackMeta}>
                    avg {formatNumber(averages.foulThrowsPerGame, true)}
                  </Text>
                </TD>
              </TR>
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

function averageRow(teams: SimpleLeagueTeamRow[]) {
  const n = teams.length || 1
  const sum = (pick: (row: SimpleLeagueTeamRow) => number) =>
    teams.reduce((total, row) => total + pick(row), 0) / n

  return {
    games: sum((row) => row.games),
    below3: sum((row) => row.below3),
    btwn4to6: sum((row) => row.btwn4to6),
    btwn7to9: sum((row) => row.btwn7to9),
    over10: sum((row) => row.over10),
    seqTotal: sum((row) => row.seqTotal),
    seqAverage: sum((row) => row.seqAverage),
    seqPoints: sum((row) => row.seqPoints),
    seqPointsPerGame: sum((row) =>
      row.games > 0 ? row.seqPoints / row.games : 0,
    ),
    shotOn: sum((row) => row.shotOn),
    shotTotal: sum((row) => row.shotTotal),
    fouls: sum((row) => row.fouls),
    foulThrows: sum((row) => row.foulThrows),
    foulsPerGame: sum((row) => (row.games > 0 ? row.fouls / row.games : 0)),
    foulThrowsPerGame: sum((row) =>
      row.games > 0 ? row.foulThrows / row.games : 0,
    ),
  }
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
    paddingVertical: 6,
    paddingHorizontal: 3,
    fontSize: 8,
  },
  th: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 5,
    paddingHorizontal: 2,
    textAlign: 'center',
  },
  thLeft: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'left',
  },
  td: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    fontSize: 8,
    textAlign: 'center',
    color: '#1e293b',
  },
  tdAlt: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    fontSize: 8,
    textAlign: 'center',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  tdTeam: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'left',
  },
  tdStack: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackMain: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  stackMeta: {
    marginTop: 1,
    fontSize: 6,
    color: '#64748b',
    textAlign: 'center',
  },
  tdAvgLabel: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
  },
  avgLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  tdAvg: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#eff6ff',
    color: '#1e3a8a',
  },
  tdAvgStack: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
})
