import React, { type FC } from 'react'
import { Table, TD, TH, TR } from '@ag-media/react-pdf-table'
import { Document, StyleSheet, View } from '@react-pdf/renderer'

import { BrandPage } from '#/components/pdf-reports/brand-page'

export type TeamResultData = {
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

export type GenSimpleTeamPDFProps = {
  tableData: Record<string, Record<string, TeamResultData>>
  teamName: string
  numberOfGames: number
  opponents: string[]
}

const sequenceCategories: { label: string; key: keyof TeamResultData }[] = [
  { label: 'Below 3', key: 'below3' },
  { label: 'Btn 4-6', key: 'btwn4to6' },
  { label: 'Btn 7-9', key: 'btwn7to9' },
  { label: 'Over 10', key: 'over10' },
  { label: 'Total', key: 'total' },
  { label: 'Average', key: 'average' },
]

export const GenSimpleTeamPDF: FC<GenSimpleTeamPDFProps> = ({
  tableData,
  teamName,
  numberOfGames,
  opponents,
}) => {
  const n = opponents.length || 1

  const getSum = (
    opponentsData: Record<string, TeamResultData>,
    key: keyof TeamResultData,
  ) =>
    opponents.reduce(
      (sum, opp) => sum + (Number(opponentsData[`vs ${opp}`]?.[key]) || 0),
      0,
    )

  const getAvg = (
    opponentsData: Record<string, TeamResultData>,
    key: keyof TeamResultData,
  ) => {
    const sum = getSum(opponentsData, key)
    return key === 'average'
      ? Math.round((sum / n) * 10) / 10
      : Math.round(sum / n)
  }

  const gamesLabel = `${numberOfGames} ${numberOfGames === 1 ? 'game' : 'games'}`
  const eventWeight = 0.13
  const subWeight = 0.08
  const summaryWeight = 0.05
  const opponentWeight =
    (1 - eventWeight - subWeight - summaryWeight * 2) /
    Math.max(opponents.length, 1)

  return (
    <Document>
      <BrandPage
        headerTitle={`${teamName || 'Team'} Dashboard  ·  ${gamesLabel}`}
        isPageNumber={false}
        footerLabel="Team Dashboard"
        dense
      >
        <View style={styles.tableContainer} wrap={false}>
          <Table
            style={styles.table}
            tdStyle={styles.cell}
            weightings={[
              eventWeight,
              subWeight,
              ...opponents.map(() => opponentWeight),
              summaryWeight,
              summaryWeight,
            ]}
          >
            <TH>
              <TD style={styles.th}>Event</TD>
              <TD style={styles.th}>Sub-event</TD>
              {opponents.map((opp) => (
                <TD key={opp} style={styles.th}>
                  {`vs ${opp}`}
                </TD>
              ))}
              <TD style={styles.th}>Total</TD>
              <TD style={styles.th}>Average</TD>
            </TH>
            {Object.entries(tableData).map(([eventName, opponentsData]) => {
              const first = Object.values(opponentsData)[0]
              const isSequenceEvent = first?.below3 !== undefined
              const hasSubEvent = first?.stat !== undefined

              const spacerRow = (
                <TR key={`${eventName}-spacer`}>
                  <TD style={styles.tdSpacer} />
                  <TD style={styles.tdSpacer} />
                  {opponents.map((opp) => (
                    <TD key={opp} style={styles.tdSpacer} />
                  ))}
                  <TD style={styles.tdSpacer} />
                  <TD style={styles.tdSpacer} />
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
                        {opponents.map((opp) => {
                          const val =
                            (opponentsData[`vs ${opp}`]?.[
                              cat.key as keyof TeamResultData
                            ] as number) ?? 0
                          const display =
                            cat.key === 'average'
                              ? Math.round(Number(val) * 10) / 10
                              : Number(val)
                          return (
                            <TD
                              key={opp}
                              style={
                                cat.label === 'Total' || cat.label === 'Average'
                                  ? styles.tdSummary
                                  : styles.td
                              }
                            >
                              {display}
                            </TD>
                          )
                        })}
                        <TD
                          style={
                            cat.label === 'Total' || cat.label === 'Average'
                              ? styles.tdSummary
                              : styles.td
                          }
                        >
                          {cat.key === 'average'
                            ? Math.round(
                                getSum(
                                  opponentsData,
                                  cat.key as keyof TeamResultData,
                                ) * 10,
                              ) / 10
                            : getSum(
                                opponentsData,
                                cat.key as keyof TeamResultData,
                              )}
                        </TD>
                        <TD
                          style={
                            cat.label === 'Total' || cat.label === 'Average'
                              ? styles.tdSummary
                              : styles.td
                          }
                        >
                          {getAvg(
                            opponentsData,
                            cat.key as keyof TeamResultData,
                          )}
                        </TD>
                      </TR>
                    ))}
                    {spacerRow}
                  </React.Fragment>
                )
              }

              if (hasSubEvent) {
                const totalStat = getSum(opponentsData, 'stat')
                const totalTotal = getSum(opponentsData, 'total')
                const totalPercent =
                  totalTotal > 0
                    ? Math.round((totalStat / totalTotal) * 100)
                    : 0
                return (
                  <React.Fragment key={eventName}>
                    <TR>
                      <TD style={styles.tdEvent}>{eventName}</TD>
                      <TD style={styles.tdSub}>{first?.title ?? ''}</TD>
                      {opponents.map((opp) => (
                        <TD key={opp} style={styles.td}>
                          {opponentsData[`vs ${opp}`]?.stat ?? 0}
                        </TD>
                      ))}
                      <TD style={styles.td}>{totalStat}</TD>
                      <TD style={styles.td}>{Math.round(totalStat / n)}</TD>
                    </TR>
                    <TR>
                      <TD style={styles.td} />
                      <TD style={styles.tdSub}>Total</TD>
                      {opponents.map((opp) => (
                        <TD key={opp} style={styles.td}>
                          {opponentsData[`vs ${opp}`]?.total ?? 0}
                        </TD>
                      ))}
                      <TD style={styles.td}>{totalTotal}</TD>
                      <TD style={styles.td}>{Math.round(totalTotal / n)}</TD>
                    </TR>
                    <TR>
                      <TD style={styles.td} />
                      <TD style={styles.tdSummary}>Percent</TD>
                      {opponents.map((opp) => (
                        <TD key={opp} style={styles.tdSummary}>
                          {(opponentsData[`vs ${opp}`]?.percent ?? 0) + '%'}
                        </TD>
                      ))}
                      <TD style={styles.tdSummary}>{totalPercent + '%'}</TD>
                      <TD style={styles.tdSummary}>{totalPercent + '%'}</TD>
                    </TR>
                    {spacerRow}
                  </React.Fragment>
                )
              }

              const totalTotal = getSum(opponentsData, 'total')
              return (
                <TR key={eventName}>
                  <TD style={styles.tdEvent}>{eventName}</TD>
                  <TD style={styles.tdSub} />
                  {opponents.map((opp) => (
                    <TD key={opp} style={styles.td}>
                      {opponentsData[`vs ${opp}`]?.total ?? 0}
                    </TD>
                  ))}
                  <TD style={styles.td}>{totalTotal}</TD>
                  <TD style={styles.td}>{Math.round(totalTotal / n)}</TD>
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
    marginTop: 16,
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
