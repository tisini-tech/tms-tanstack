import { StyleSheet, Text, View } from '@react-pdf/renderer'

interface PassMatrixTableProps {
  passMatrix: { [passer: string]: { [receiver: string]: string } }
}

const TABLE_WIDTH = 760
const CORNER_WIDTH = 54

export function PassMatrixTable({ passMatrix }: PassMatrixTableProps) {
  const allPlayers = new Set<string>()
  Object.keys(passMatrix).forEach((passer) => {
    allPlayers.add(passer)
    Object.keys(passMatrix[passer] || {}).forEach((receiver) => {
      allPlayers.add(receiver)
    })
  })

  const players = Array.from(allPlayers).sort()
  const cellWidth = Math.max(
    18,
    Math.floor((TABLE_WIDTH - CORNER_WIDTH) / Math.max(players.length, 1)),
  )
  const fontSize = players.length > 14 ? 4.5 : players.length > 11 ? 5 : 6

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pass Distribution (Passer v Receiver)</Text>
      <View style={styles.tableContainer}>
        <View style={[styles.table, { width: CORNER_WIDTH + cellWidth * players.length }]}>
          <View style={styles.headerRow}>
            <View style={[styles.cornerCell, { width: CORNER_WIDTH }]} />
            {players.map((player) => (
              <View
                key={player}
                style={[styles.headerCell, { width: cellWidth }]}
              >
                <Text style={[styles.headerText, { fontSize }]}>{player}</Text>
              </View>
            ))}
          </View>

          {players.map((passer) => (
            <View key={passer} style={styles.dataRow}>
              <View style={[styles.rowHeaderCell, { width: CORNER_WIDTH }]}>
                <Text style={[styles.rowHeaderText, { fontSize }]}>
                  {passer}
                </Text>
              </View>
              {players.map((receiver) => {
                const value = passMatrix[passer]?.[receiver] || '0'
                const isDiagonal = passer === receiver

                return (
                  <View
                    key={`${passer}-${receiver}`}
                    style={[
                      styles.dataCell,
                      { width: cellWidth },
                      ...(isDiagonal ? [styles.diagonalCell] : []),
                    ]}
                  >
                    <Text
                      style={[
                        styles.dataText,
                        { fontSize },
                        ...(isDiagonal ? [styles.diagonalText] : []),
                      ]}
                    >
                      {isDiagonal ? '-' : value}
                    </Text>
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
  },
  table: {
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
  },
  cornerCell: {
    backgroundColor: '#1e40af',
    borderRightWidth: 1,
    borderRightColor: '#1e3a8a',
  },
  headerCell: {
    paddingVertical: 3,
    paddingHorizontal: 1,
    borderRightWidth: 1,
    borderRightColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  rowHeaderCell: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  rowHeaderText: {
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'left',
  },
  dataCell: {
    paddingVertical: 2,
    paddingHorizontal: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagonalCell: {
    backgroundColor: '#f1f5f9',
  },
  dataText: {
    color: '#1e293b',
    textAlign: 'center',
  },
  diagonalText: {
    color: '#64748b',
    fontWeight: 'bold',
  },
})
