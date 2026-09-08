import { StyleSheet, Text, View } from '@react-pdf/renderer'

import { formatStatDisplay } from '#/components/pdf-reports/format-stat-display'
import type { PlayerTableRow } from '#/components/pdf-reports/pdf-types'
import { HOCKEY_PLAYER_COLUMNS } from '#/components/pdf-reports/sports/hockey/hockey-metrics'

type HockeyPlayerStatsTableProps = {
  stats: PlayerTableRow[]
  teamName: string
}

export function HockeyPlayerStatsTable({
  stats,
  teamName,
}: HockeyPlayerStatsTableProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{teamName} — Player stats</Text>
      <View style={styles.table}>
        <View style={styles.header}>
          {HOCKEY_PLAYER_COLUMNS.map((column) => (
            <Text
              key={column.key}
              style={[styles.headerCell, widthStyle(column.width)]}
            >
              {column.header}
            </Text>
          ))}
        </View>

        {stats.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No player stats for this team.</Text>
          </View>
        ) : (
          stats.map((player, index) => (
            <View key={index} style={styles.row}>
              {HOCKEY_PLAYER_COLUMNS.map((column) => {
                const value = player[column.key]
                let display: string
                if (column.key === 'Player name') {
                  display =
                    value != null && value !== '' ? String(value) : '—'
                } else if (column.key === 'rating' && typeof value === 'number') {
                  display = value.toFixed(1)
                } else {
                  display = formatStatDisplay(value)
                }

                return (
                  <Text
                    key={column.key}
                    style={[styles.cell, widthStyle(column.width)]}
                  >
                    {display}
                  </Text>
                )
              })}
            </View>
          ))
        )}
      </View>
    </View>
  )
}

function widthStyle(width: 'name' | 'stat' | 'narrow' | 'ratio') {
  if (width === 'name') return styles.nameCol
  if (width === 'ratio') return styles.ratioCol
  if (width === 'narrow') return styles.narrowCol
  return styles.statCol
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  emptyRow: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  emptyText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  cell: {
    fontSize: 5.5,
    color: '#1e293b',
    paddingVertical: 3,
    paddingHorizontal: 1,
  },
  nameCol: {
    width: '12%',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'left',
    paddingLeft: 3,
  },
  statCol: {
    width: '5%',
    textAlign: 'center',
  },
  narrowCol: {
    width: '5%',
    textAlign: 'center',
  },
  ratioCol: {
    width: '9%',
    textAlign: 'center',
  },
})
