import { StyleSheet, Text, View } from '@react-pdf/renderer'

import { formatStatDisplay } from './format-stat-display'

interface PlayerStatsTableProps {
  stats: Array<{ [key: string]: string | number }>
  col: string
  compact?: boolean
  neutralHeader?: boolean
  hidePlayerName?: boolean
  hideRating?: boolean
}

export const PlayerStatsTable = ({
  stats,
  col,
  compact = false,
  neutralHeader = false,
  hidePlayerName = false,
  hideRating = false,
}: PlayerStatsTableProps) => {
  const attackingColumns = [
    { key: 'Player name', header: ' ', width: 'name' as const },
    { key: 'rating', header: 'Rating', width: 'stat' as const },
    { key: 'mins', header: 'Mins', width: 'stat' as const },
    { key: 'goal', header: 'Goal', width: 'stat' as const },
    { key: 'assist', header: 'Assist', width: 'stat' as const },
    {
      key: 'Shots / on target',
      header: 'Shots / on target',
      width: 'stat' as const,
    },
    {
      key: 'Crosses / accurate',
      header: 'Cross / accurate',
      width: 'stat' as const,
    },
    { key: 'Box touch', header: 'Box touch', width: 'stat' as const },
    { key: 'Box carry', header: 'Box carry', width: 'stat' as const },
    { key: 'chances', header: 'Chance', width: 'stat' as const },
    {
      key: 'Passes / complete',
      header: 'Pass / accurate',
      width: 'stat' as const,
    },
    {
      key: 'Progress Passes / complete',
      header: 'Prog pass / accurate',
      width: 'stat' as const,
    },
  ]

  const defensiveColumns = [
    { key: 'Player name', header: ' ', width: 'name' as const },
    { key: 'rating', header: 'Rating', width: 'stat' as const },
    { key: 'mins', header: 'Mins', width: 'stat' as const },
    { key: 'Blocks', header: 'Blocks', width: 'stat' as const },
    { key: 'Clearance', header: 'Clearance', width: 'stat' as const },
    {
      key: 'Interception own / opp',
      header: 'Interception own / opp',
      width: 'stat' as const,
    },
    {
      key: 'Ball won / lost',
      header: 'Ball won / lost',
      width: 'stat' as const,
    },
    { key: 'Second ball', header: 'Second ball', width: 'stat' as const },
    {
      key: 'Tackles / won',
      header: 'Tackles / won',
      width: 'stat' as const,
    },
    {
      key: 'Aerial duels / won',
      header: 'Aerial duels / won',
      width: 'stat' as const,
    },
    {
      key: 'Foul won / comm',
      header: 'Foul won / comm',
      width: 'stat' as const,
    },
    {
      key: 'Card yellow / red',
      header: 'Card yellow / red',
      width: 'stat' as const,
    },
  ]

  const goalkeepingColumns = [
    { key: 'Player name', header: ' ', width: 'name' as const },
    { key: 'rating', header: 'Rating', width: 'stat' as const },
    { key: 'Saves', header: 'Saves', width: 'stat' as const },
    {
      key: 'Claims / successful',
      header: 'Claims / successful',
      width: 'stat' as const,
    },
    {
      key: 'Distribution',
      header: 'Distribution',
      width: 'stat' as const,
    },
    {
      key: 'Goal kicks / complete',
      header: 'Goal kicks / complete',
      width: 'stat' as const,
    },
    {
      key: 'Kick-outs / complete',
      header: 'Kick-outs / complete',
      width: 'stat' as const,
    },
    {
      key: 'Throw-outs / complete',
      header: 'Throw-outs / complete',
      width: 'stat' as const,
    },
    {
      key: 'Run-outs / successful',
      header: 'Run-outs / successful',
      width: 'stat' as const,
    },
  ]

  const columns = (
    col === 'attacking'
      ? attackingColumns
      : col === 'defensive'
        ? defensiveColumns
        : goalkeepingColumns
  ).filter((column) => {
    if (hidePlayerName && column.key === 'Player name') return false
    if (hideRating && column.key === 'rating') return false
    return true
  })

  const isGkOnlyStats = col === 'goalkeeping' && hidePlayerName

  return (
    <View
      style={
        compact
          ? neutralHeader
            ? styles.playerStatsTableNeutral
            : styles.playerStatsTableCompact
          : styles.playerStatsTable
      }
    >
      {/* Table Header */}
      <View
        style={
          neutralHeader
            ? styles.playerTableHeaderNeutral
            : styles.playerTableHeader
        }
      >
        {columns.map((column, index) => (
          <Text
            key={index}
            style={[
              neutralHeader
                ? styles.playerTableHeaderCellNeutral
                : styles.playerTableHeaderCell,
              column.width === 'name'
                ? styles.playerNameCol
                : isGkOnlyStats
                  ? styles.gkStatCol
                  : styles.playerStatCol,
            ]}
          >
            {column.header}
          </Text>
        ))}
      </View>
      {/* Table Rows */}
      {stats.map((player, index) => (
        <View key={index} style={styles.playerTableRow}>
          {columns.map((column, colIndex) => (
            <Text
              key={colIndex}
              style={[
                neutralHeader
                  ? styles.playerTableCellNeutral
                  : styles.playerTableCell,
                column.width === 'name'
                  ? styles.playerNameCol
                  : isGkOnlyStats
                    ? styles.gkStatCol
                    : styles.playerStatCol,
              ]}
            >
              {(() => {
                const value = player[column.key]
                if (column.key === 'Player name') {
                  return value != null && value !== '' ? String(value) : '—'
                }
                if (column.key === 'rating' && typeof value === 'number') {
                  return value.toFixed(1)
                }
                return formatStatDisplay(value)
              })()}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  playerStatsTable: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1,
  },
  playerStatsTableCompact: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    width: '100%',
  },
  playerStatsTableNeutral: {
    width: '100%',
    overflow: 'hidden',
  },
  playerTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
  },
  playerTableHeaderNeutral: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  playerTableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  playerTableHeaderCellNeutral: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  playerTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  playerTableCell: {
    fontSize: 6,
    color: '#1e293b',
    paddingVertical: 3,
    paddingHorizontal: 3,
    textAlign: 'left',
  },
  playerTableCellNeutral: {
    fontSize: 8,
    color: '#1e293b',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Column widths for player table
  playerNameCol: {
    width: '12%',
    fontWeight: 'bold',
  },
  playerStatCol: {
    width: '8.8%',
    textAlign: 'center',
  },
  gkStatCol: {
    width: '14.28%',
    textAlign: 'center',
  },
})
