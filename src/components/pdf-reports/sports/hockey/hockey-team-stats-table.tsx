import { StyleSheet, Text, View } from '@react-pdf/renderer'

import { formatStatDisplay } from '#/components/pdf-reports/format-stat-display'
import type { TableData } from '#/components/pdf-reports/pdf-types'

type HockeyTeamStatsTableProps = {
  stats: TableData
  teamName: string
}

export function HockeyTeamStatsTable({
  stats,
  teamName,
}: HockeyTeamStatsTableProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{teamName} — Team stats</Text>
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={[styles.headerCell, styles.eventCol]}>Event</Text>
          <Text style={[styles.headerCell, styles.statsCol]}>Stats</Text>
          <Text style={[styles.headerCell, styles.accCol]}>Acc.</Text>
        </View>

        {Object.entries(stats).map(([key, value]) => {
          if (typeof value === 'string') {
            return (
              <View key={key} style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>{key}</Text>
              </View>
            )
          }

          const statsValue = formatStatDisplay(value.stats)
          const accValue =
            value.acc === '' || value.acc == null
              ? ''
              : typeof value.acc === 'number'
                ? `${value.acc}%`
                : String(value.acc)

          return (
            <View key={key} style={styles.row}>
              <Text style={[styles.cell, styles.eventCol]}>{key}</Text>
              <Text style={[styles.cell, styles.statsCol]}>{statsValue}</Text>
              <Text style={[styles.cell, styles.accCol]}>{accValue}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '55%',
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
  },
  headerCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  sectionRow: {
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cell: {
    fontSize: 8,
    color: '#1e293b',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  eventCol: {
    width: '50%',
    textAlign: 'left',
  },
  statsCol: {
    width: '30%',
    textAlign: 'center',
  },
  accCol: {
    width: '20%',
    textAlign: 'center',
  },
})
