import { StyleSheet, Text, View } from '@react-pdf/renderer'

import type { TableData } from './pdf-types'

export function TeamStatsTable({ stats }: { stats: TableData }) {
  return (
    <View style={styles.leftSection}>
      <View style={styles.statsTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.eventColumn]}>
            Event
          </Text>
          <Text style={[styles.tableHeaderCell, styles.statsColumn]}>
            Stats
          </Text>
          <Text style={[styles.tableHeaderCell, styles.accColumn]}>Acc.</Text>
        </View>

        {Object.entries(stats).map(([key, value]) => {
          if (typeof value === 'string') {
            return <View key={key} style={styles.separatorRow} />
          }

          const statsValue =
            typeof value.stats === 'number'
              ? value.stats.toString()
              : value.stats
          const accValue =
            typeof value.acc === 'number' ? `${value.acc}%` : value.acc || ''

          return (
            <View key={key} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.eventColumn]}>{key}</Text>
              <Text style={[styles.tableCell, styles.statsColumn]}>
                {statsValue}
              </Text>
              <Text style={[styles.tableCell, styles.accColumn]}>
                {accValue}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  leftSection: {
    width: '25%',
    paddingRight: 10,
  },
  statsTable: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  separatorRow: {
    minHeight: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 8,
    color: '#1e293b',
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: 'left',
  },
  eventColumn: {
    width: '50%',
  },
  statsColumn: {
    width: '30%',
    textAlign: 'center',
  },
  accColumn: {
    width: '20%',
    textAlign: 'center',
  },
})
