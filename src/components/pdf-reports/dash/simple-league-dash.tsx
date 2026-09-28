import React, { type FC } from 'react'
import { Table, TD, TH, TR } from '@ag-media/react-pdf-table'
import { Document, StyleSheet, View } from '@react-pdf/renderer'

import { BrandPage } from '#/components/pdf-reports/brand-page'

export type LeagueResultData = {
  title?: string
  total: number
  stat?: number
  percent?: number
  below3?: number
  btwn4to6?: number
  btwn7to9?: number
  over10?: number
  average?: number
}

export type LeaguePDFProps = {
  tableData: Record<string, Record<string, LeagueResultData>>
  teamNames: string[]
  teamGamesCount: Record<string, number>
  displayMode: 'total' | 'average' | 'both'
  tournamentName?: string
  seasonName?: string
  numberOfTeams?: number
  gamesPlayed?: number
}

const sequenceCategories: { label: string; key: keyof LeagueResultData }[] = [
  { label: 'Below 3', key: 'below3' },
  { label: 'Btn 4-6', key: 'btwn4to6' },
  { label: 'Btn 7-9', key: 'btwn7to9' },
  { label: 'Over 10', key: 'over10' },
  { label: 'Total', key: 'total' },
  { label: 'Average', key: 'average' },
]

export const GenSimpleLeaguePDF: FC<LeaguePDFProps> = ({
  tableData,
  teamNames,
  teamGamesCount,
  displayMode,
  tournamentName = '',
  seasonName = '',
  numberOfTeams = 0,
  gamesPlayed = 0,
}) => {
  const formatCell = (value: number, team: string) => {
    const n = value ?? 0
    const games = teamGamesCount[team] || 1
    const avg = Math.round((n / games) * 10) / 10
    if (displayMode === 'total') return String(n)
    if (displayMode === 'average') return String(avg)
    return `${n} (${avg})`
  }

  const headerBits = [
    tournamentName,
    seasonName,
    `${numberOfTeams} ${numberOfTeams === 1 ? 'team' : 'teams'}`,
    `${gamesPlayed} ${gamesPlayed === 1 ? 'game' : 'games'}`,
  ].filter(Boolean)

  const eventWeight = 0.14
  const subWeight = 0.1
  const teamWeight =
    (1 - eventWeight - subWeight) / Math.max(teamNames.length, 1)

  return (
    <Document>
      <BrandPage
        headerTitle={`League Dashboard  ·  ${headerBits.join('  ·  ')}`}
        isPageNumber={false}
        footerLabel="League Dashboard"
        dense
      >
        <View style={styles.tableContainer} wrap={false}>
          <Table
            style={styles.table}
            tdStyle={styles.cell}
            weightings={[
              eventWeight,
              subWeight,
              ...teamNames.map(() => teamWeight),
            ]}
          >
            <TH>
              <TD style={styles.th}>Event</TD>
              <TD style={styles.th}>Sub-event</TD>
              {teamNames.map((team) => (
                <TD key={team} style={styles.th}>
                  {team}
                </TD>
              ))}
            </TH>
            <TR>
              <TD style={styles.tdSummary}>Games played</TD>
              <TD style={styles.tdSub} />
              {teamNames.map((team) => (
                <TD key={team} style={styles.tdSummary}>
                  {teamGamesCount[team] ?? 0}
                </TD>
              ))}
            </TR>
            {Object.entries(tableData).map(([eventName, teamsData]) => {
              const firstTeamData = Object.values(teamsData)[0]
              const isSequenceEvent = firstTeamData?.below3 !== undefined
              const hasSubEvent = firstTeamData?.stat !== undefined

              const spacerRow = (
                <TR key={`${eventName}-spacer`}>
                  <TD style={styles.tdSpacer} />
                  <TD style={styles.tdSpacer} />
                  {teamNames.map((team) => (
                    <TD key={team} style={styles.tdSpacer} />
                  ))}
                </TR>
              )

              if (isSequenceEvent) {
                return (
                  <React.Fragment key={eventName}>
                    {sequenceCategories.map((cat, index) => (
                      <TR key={`${eventName}-${cat.key}`}>
                        <TD style={index === 0 ? styles.tdEvent : styles.td}>
                          {index === 0 ? eventName : ''}
                        </TD>
                        <TD
                          style={
                            cat.label === 'Total' || cat.label === 'Average'
                              ? styles.tdSummary
                              : styles.tdSub
                          }
                        >
                          {cat.label}
                        </TD>
                        {teamNames.map((team) => {
                          const val =
                            (teamsData[team]?.[
                              cat.key as keyof LeagueResultData
                            ] as number) ?? 0
                          const num = Number(val)
                          const text =
                            cat.key === 'average'
                              ? String(num)
                              : formatCell(num, team)
                          return (
                            <TD
                              key={team}
                              style={
                                cat.label === 'Total' || cat.label === 'Average'
                                  ? styles.tdSummary
                                  : styles.td
                              }
                            >
                              {text}
                            </TD>
                          )
                        })}
                      </TR>
                    ))}
                    {spacerRow}
                  </React.Fragment>
                )
              }

              if (hasSubEvent) {
                return (
                  <React.Fragment key={eventName}>
                    <TR>
                      <TD style={styles.tdEvent}>{eventName}</TD>
                      <TD style={styles.tdSub}>{firstTeamData?.title ?? ''}</TD>
                      {teamNames.map((team) => (
                        <TD key={team} style={styles.td}>
                          {formatCell(teamsData[team]?.stat ?? 0, team)}
                        </TD>
                      ))}
                    </TR>
                    <TR>
                      <TD style={styles.td} />
                      <TD style={styles.tdSub}>Total</TD>
                      {teamNames.map((team) => (
                        <TD key={team} style={styles.td}>
                          {formatCell(teamsData[team]?.total ?? 0, team)}
                        </TD>
                      ))}
                    </TR>
                    <TR>
                      <TD style={styles.td} />
                      <TD style={styles.tdSummary}>Percent</TD>
                      {teamNames.map((team) => (
                        <TD key={team} style={styles.tdSummary}>
                          {(teamsData[team]?.percent ?? 0) + '%'}
                        </TD>
                      ))}
                    </TR>
                    {spacerRow}
                  </React.Fragment>
                )
              }

              return (
                <TR key={eventName}>
                  <TD style={styles.tdEvent}>{eventName}</TD>
                  <TD style={styles.tdSub} />
                  {teamNames.map((team) => (
                    <TD key={team} style={styles.td}>
                      {formatCell(teamsData[team]?.total ?? 0, team)}
                    </TD>
                  ))}
                </TR>
              )
            })}
          </Table>
        </View>
      </BrandPage>
    </Document>
  )
}

const styles = StyleSheet.create({
  tableContainer: {
    marginTop: 28,
  },
  table: {
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  cell: {
    paddingVertical: 6,
    paddingHorizontal: 3,
    fontSize: 10,
  },
  th: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingVertical: 5,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  td: {
    paddingVertical: 6,
    paddingHorizontal: 3,
    fontSize: 10,
    textAlign: 'center',
    color: '#1e293b',
  },
  tdEvent: {
    paddingVertical: 6,
    paddingHorizontal: 3,
    fontSize: 10,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  tdSub: {
    paddingVertical: 6,
    paddingHorizontal: 3,
    fontSize: 10,
    textAlign: 'left',
    color: '#334155',
  },
  tdSummary: {
    paddingVertical: 6,
    paddingHorizontal: 3,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#eff6ff',
    color: '#1e3a8a',
  },
  tdSpacer: {
    paddingVertical: 5,
    fontSize: 6,
    borderBottomWidth: 0,
    backgroundColor: '#ffffff',
  },
})
