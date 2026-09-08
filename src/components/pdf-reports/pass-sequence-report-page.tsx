import { StyleSheet, Text, View } from '@react-pdf/renderer'

import { BrandPage } from '#/components/pdf-reports/brand-page'
import { getPassSeqs } from '#/lib/utils'
import type { EventSequence, SimpleFixture } from '#/lib/types'

const MAX_ALL_SEQUENCE_ROWS = 40
const MAX_DETAIL_ROWS = 10

type PassSequenceReportPageProps = {
  fixture: SimpleFixture
  teamName: string
  sequences: EventSequence[]
}

function byPassCountDesc(a: EventSequence, b: EventSequence) {
  return b.pass_count - a.pass_count
}

function sequenceKey(seq: EventSequence) {
  return [
    seq.pass_count,
    seq.next_event,
    seq.player,
    seq.quarter,
    seq.minute,
    seq.second,
  ].join('|')
}

function outcomeColor(outcome: string) {
  const normalized = outcome.trim().toLowerCase()
  if (normalized === 'positive') return '#059669'
  if (normalized === 'negative') return '#dc2626'
  return '#d97706'
}

export function PassSequenceReportPage({
  fixture,
  teamName,
  sequences,
}: PassSequenceReportPageProps) {
  const lengthBuckets = getPassSeqs(sequences)
  const totalPasses = sequences.reduce((sum, seq) => sum + seq.pass_count, 0)
  const avgPasses =
    sequences.length > 0 ? (totalPasses / sequences.length).toFixed(1) : '0.0'

  const sortedSequences = [...sequences].sort(byPassCountDesc)
  const allRows = sortedSequences.slice(0, MAX_ALL_SEQUENCE_ROWS)

  const shotSequences = sequences
    .filter((seq) => seq.next_event.toLowerCase().includes('shot'))
    .sort(byPassCountDesc)
  const shotsOnTarget = shotSequences.filter(
    (seq) => seq.outcome.toLowerCase() === 'positive',
  ).length
  const shotAccuracy =
    shotSequences.length > 0
      ? ((shotsOnTarget / shotSequences.length) * 100).toFixed(1)
      : '0.0'

  const crossSequences = sequences
    .filter((seq) => seq.next_event.toLowerCase().includes('cross'))
    .sort(byPassCountDesc)
  const crossComplete = crossSequences.filter(
    (seq) => seq.outcome.toLowerCase() === 'positive',
  ).length
  const crossAccuracy =
    crossSequences.length > 0
      ? ((crossComplete / crossSequences.length) * 100).toFixed(1)
      : '0.0'

  const shotRows = shotSequences.slice(0, MAX_DETAIL_ROWS)
  const crossRows = crossSequences.slice(0, MAX_DETAIL_ROWS)

  return (
    <BrandPage fixture={fixture}>
      <View style={styles.page}>
        <Text style={styles.pageTitle}>
          {teamName} — Pass sequence analysis
        </Text>

        <View style={styles.pageContainer}>
          <View style={styles.leftSection}>
            <SequenceTable
              title="All sequences"
              rows={allRows}
              emptyLabel="No pass sequences."
              compact
              footerNote={
                sequences.length > MAX_ALL_SEQUENCE_ROWS
                  ? `Showing top ${MAX_ALL_SEQUENCE_ROWS} of ${sequences.length}`
                  : undefined
              }
            />
          </View>

          <View style={styles.rightSection}>
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricTitle}>Total sequences</Text>
                <Text style={styles.metricValue}>{sequences.length}</Text>
                <Text style={styles.metricHint}>{totalPasses} total passes</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricTitle}>Avg pass sequence</Text>
                <Text style={styles.metricValue}>{avgPasses}</Text>
              </View>
              <View style={styles.metricBoxWide}>
                <Text style={styles.metricTitle}>Sequence length</Text>
                <View style={styles.bucketRow}>
                  <Bucket label="10+" value={lengthBuckets.over10} />
                  <Bucket label="7-9" value={lengthBuckets.btwn7to9} />
                  <Bucket label="4-6" value={lengthBuckets.btwn4to6} />
                  <Bucket label="1-3" value={lengthBuckets.below3} />
                </View>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Ended in shot</Text>
                <View style={styles.summaryStatsRow}>
                  <SummaryStat label="Shots" value={String(shotSequences.length)} />
                  <SummaryStat label="On target" value={String(shotsOnTarget)} />
                  <SummaryStat label="Accuracy" value={`${shotAccuracy}%`} />
                </View>
              </View>
              <View style={styles.summaryBoxRight}>
                <Text style={styles.summaryTitle}>Ended in cross</Text>
                <View style={styles.summaryStatsRow}>
                  <SummaryStat
                    label="Crosses"
                    value={String(crossSequences.length)}
                  />
                  <SummaryStat label="Completed" value={String(crossComplete)} />
                  <SummaryStat label="Accuracy" value={`${crossAccuracy}%`} />
                </View>
              </View>
            </View>

            <View style={styles.detailTablesRow}>
              <View style={styles.detailTablePanel}>
                <SequenceTable
                  title="Ended in shot"
                  rows={shotRows}
                  emptyLabel="No sequences ended in a shot."
                />
              </View>
              <View style={styles.detailTablePanelRight}>
                <SequenceTable
                  title="Ended in cross"
                  rows={crossRows}
                  emptyLabel="No sequences ended in a cross."
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </BrandPage>
  )
}

function Bucket({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.bucket}>
      <Text style={styles.bucketValue}>{value}</Text>
      <Text style={styles.bucketLabel}>{label}</Text>
    </View>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatValue}>{value}</Text>
      <Text style={styles.summaryStatLabel}>{label}</Text>
    </View>
  )
}

function SequenceTable({
  title,
  rows,
  emptyLabel,
  compact = false,
  footerNote,
}: {
  title: string
  rows: EventSequence[]
  emptyLabel: string
  compact?: boolean
  footerNote?: string
}) {
  const thStyle = compact ? styles.thCompact : styles.th
  const tdStyle = compact ? styles.tdCompact : styles.td

  return (
    <View>
      <Text style={styles.tableTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[thStyle, styles.colPasses]}>Passes</Text>
          <Text style={[thStyle, styles.colEnded]}>Ended with</Text>
          <Text style={[thStyle, styles.colPlayer]}>Player</Text>
          <Text style={[thStyle, styles.colOutcome]}>Outcome</Text>
        </View>

        {rows.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>{emptyLabel}</Text>
          </View>
        ) : (
          rows.map((row, index) => (
            <View key={`${sequenceKey(row)}-${index}`} style={styles.tr}>
              <Text style={[tdStyle, styles.colPasses]}>{row.pass_count}</Text>
              <Text style={[tdStyle, styles.colEnded]}>
                {row.next_event || '—'}
              </Text>
              <Text style={[tdStyle, styles.colPlayer]}>
                {row.player || '—'}
              </Text>
              <Text
                style={[
                  tdStyle,
                  styles.colOutcome,
                  { color: outcomeColor(row.outcome) },
                ]}
              >
                {row.outcome || '—'}
              </Text>
            </View>
          ))
        )}
      </View>
      {footerNote ? <Text style={styles.footerNote}>{footerNote}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
  },
  pageTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  pageContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  leftSection: {
    width: '25%',
    paddingRight: 8,
  },
  rightSection: {
    width: '75%',
    paddingLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 18,
  },
  metricBox: {
    width: '28%',
    marginRight: '2%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
  },
  metricBoxWide: {
    width: '40%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
  },
  metricTitle: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  metricHint: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 3,
  },
  bucketRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  bucket: {
    width: '25%',
    alignItems: 'center',
  },
  bucketValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  bucketLabel: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 18,
  },
  summaryBox: {
    width: '49%',
    marginRight: '2%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
  },
  summaryBoxRight: {
    width: '49%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
  },
  summaryTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  summaryStat: {
    width: '33%',
  },
  summaryStatValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  summaryStatLabel: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 1,
  },
  detailTablesRow: {
    flexDirection: 'row',
    width: '100%',
  },
  detailTablePanel: {
    width: '49%',
    marginRight: '2%',
  },
  detailTablePanelRight: {
    width: '49%',
  },
  tableTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    width: '100%',
  },
  th: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  thCompact: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  td: {
    fontSize: 7,
    color: '#1e293b',
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tdCompact: {
    fontSize: 5.5,
    color: '#1e293b',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  emptyRow: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  emptyText: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 6,
    color: '#64748b',
    marginTop: 2,
  },
  colPasses: {
    width: '14%',
    textAlign: 'center',
  },
  colEnded: {
    width: '40%',
    textAlign: 'left',
  },
  colPlayer: {
    width: '28%',
    textAlign: 'left',
  },
  colOutcome: {
    width: '18%',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },
})
