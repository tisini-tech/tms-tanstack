import { Fragment } from 'react'
import { Table, TD, TH, TR } from '@ag-media/react-pdf-table'
import { Document, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { ReviewTableData } from '#/components/fixtures/review/transform-review-stats'

import { BrandPage } from '../brand-page'

const brandBlue = '#1e40af'
const lightBlue = '#dbeafe'

// @ag-media/react-pdf-table uses weighting (0–1), not CSS width
const EVENT_WEIGHT = 0.09
const SUB_EVENT_WEIGHT = 0.1

interface AgentsReviewPDFProps {
  tableData: ReviewTableData
}

function getAgentWeight(agentCount: number): number {
  const remaining = 1 - EVENT_WEIGHT - SUB_EVENT_WEIGHT
  return remaining / Math.max(agentCount, 1)
}

export function AgentsReviewPDF({ tableData }: AgentsReviewPDFProps) {
  const { fixture, teamLabel, columns, rows } = tableData
  const agentWeight = getAgentWeight(columns.length)

  return (
    <Document>
      <BrandPage fixture={fixture}>
        <View style={styles.body}>
          <Text style={styles.title}>{teamLabel} Agents Data</Text>
          <Table>
            <TH>
              <TD weighting={EVENT_WEIGHT} style={styles.tableHeader}>
                Event
              </TD>
              <TD weighting={SUB_EVENT_WEIGHT} style={styles.tableHeader}>
                Sub-Event
              </TD>
              {columns.map((column) => (
                <TD
                  key={column.key}
                  weighting={agentWeight}
                  style={styles.tableHeader}
                >
                  {column.agentLabel}
                </TD>
              ))}
            </TH>

            {rows.map((event) => (
              <Fragment key={event.eventId}>
                <TR>
                  <TD
                    weighting={EVENT_WEIGHT}
                    style={[styles.tableCell, styles.eventCell]}
                  >
                    {event.eventName}
                  </TD>
                  <TD
                    weighting={SUB_EVENT_WEIGHT}
                    style={[styles.tableCell, styles.eventCell]}
                  >
                    —
                  </TD>
                  {columns.map((column) => (
                    <TD
                      key={`${event.eventId}-${column.key}`}
                      weighting={agentWeight}
                      style={styles.tableCell}
                    >
                      {event.values[column.key] ?? 0}
                    </TD>
                  ))}
                </TR>

                {event.subEvents.map((subEvent) => (
                  <TR key={`${event.eventId}-${subEvent.subeventId}`}>
                    <TD weighting={EVENT_WEIGHT} style={styles.tableCell}>
                      {' '}
                    </TD>
                    <TD
                      weighting={SUB_EVENT_WEIGHT}
                      style={[styles.tableCell, styles.subEventCell]}
                    >
                      {subEvent.name}
                    </TD>
                    {columns.map((column) => (
                      <TD
                        key={`${event.eventId}-${subEvent.subeventId}-${column.key}`}
                        weighting={agentWeight}
                        style={styles.tableCellMuted}
                      >
                        {subEvent.values[column.key] ?? 0}
                      </TD>
                    ))}
                  </TR>
                ))}
              </Fragment>
            ))}
          </Table>
        </View>
      </BrandPage>
    </Document>
  )
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    width: '100%',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: brandBlue,
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: lightBlue,
    color: brandBlue,
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 5,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 7,
    paddingVertical: 4,
    paddingHorizontal: 3,
    textAlign: 'center',
    borderColor: lightBlue,
  },
  eventCell: {
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: 7,
  },
  subEventCell: {
    textAlign: 'left',
    color: '#64748b',
  },
  tableCellMuted: {
    fontSize: 7,
    paddingVertical: 4,
    paddingHorizontal: 3,
    textAlign: 'center',
    color: '#64748b',
    borderColor: lightBlue,
  },
})
