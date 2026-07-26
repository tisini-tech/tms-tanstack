import { Table, TD, TH, TR } from '@ag-media/react-pdf-table'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { FixtureTeamStats } from '#/lib/types'
import {
  getEventCount,
  getPercent,
  getSubEventCount,
  getPassSeqs,
} from '#/lib/utils'

const brandBlue = '#1a73e8'
const lightBlue = '#e8f0fe'
const darkBlue = '#0d47a1'

export const GenerateTeamStatsPDF = ({
  teamStats,
}: {
  teamStats: FixtureTeamStats
}) => {
  const today = new Date()
  const formatDate = new Date(today).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const stats = teamStats.stats
  const fixture = teamStats.fixture
  const sequences = teamStats.sequences
  const homeSeq = getPassSeqs(sequences.home)
  const awaySeq = getPassSeqs(sequences.away)

  const homeInBoxComp =
    getSubEventCount('165', '422', stats, true) +
    getSubEventCount('238', '606', stats, true)

  const awayInBoxComp =
    getSubEventCount('165', '422', stats, false) +
    getSubEventCount('238', '606', stats, false)

  const homeInBox =
    getEventCount('165', stats, true) +
    getSubEventCount('238', '606', stats, true) +
    getSubEventCount('238', '607', stats, true) +
    getSubEventCount('238', '608', stats, true) +
    getSubEventCount('238', '609', stats, true)

  const awayInBox =
    getEventCount('165', stats, false) +
    getSubEventCount('238', '606', stats, false) +
    getSubEventCount('238', '607', stats, false) +
    getSubEventCount('238', '608', stats, false) +
    getSubEventCount('238', '609', stats, false)

  const homeOutBoxComp =
    getSubEventCount('156', '405', stats, true) +
    getSubEventCount('238', '610', stats, true)

  const awayOutBoxComp =
    getSubEventCount('156', '405', stats, false) +
    getSubEventCount('238', '610', stats, false)

  const homeOutBox =
    getEventCount('156', stats, true) +
    getSubEventCount('238', '610', stats, true) +
    getSubEventCount('238', '611', stats, true) +
    getSubEventCount('238', '612', stats, true) +
    getSubEventCount('238', '613', stats, true)

  const awayOutBox =
    getEventCount('156', stats, false) +
    getSubEventCount('238', '610', stats, false) +
    getSubEventCount('238', '611', stats, false) +
    getSubEventCount('238', '612', stats, false) +
    getSubEventCount('238', '613', stats, false)

  const hCompRestart = getSubEventCount('216', '522', stats, true)
  const aCompRestart = getSubEventCount('216', '522', stats, false)

  const hCompGoalkick =
    getSubEventCount('239', '614', stats, true) +
    getSubEventCount('239', '616', stats, true)
  const aCompGoalkick =
    getSubEventCount('239', '614', stats, false) +
    getSubEventCount('239', '616', stats, false)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* Brand Logo at the top */}
          <Image src="/tisini.png" style={styles.brandLogo} />

          {/* Match info row */}
          <View style={styles.matchInfoRow}>
            {/* Left: Home team */}
            <View style={styles.teamContainer}>
              <Image src={'/homeLogo.png'} style={styles.teamLogo} />
              <Text style={styles.teamName}>{fixture.home_team}</Text>
            </View>

            {/* Center: Scores */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{fixture.home_score}</Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.scoreText}>{fixture.away_score}</Text>
            </View>

            {/* Right: Away team */}
            <View style={styles.teamContainer}>
              <Image src={'/awayLogo.png'} style={styles.teamLogo} />
              <Text style={styles.teamName}>{fixture.away_team}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Table>
            <TH>
              <TD style={styles.tableHeader}>{''}</TD>
              <TD style={styles.tableHeader}>{'    '}</TD>
              <TD style={styles.tableHeader}>{''}</TD>
            </TH>

            <TR>
              <TD style={styles.tableCell}>{homeSeq.total}</TD>
              <TD style={styles.tableCellMetric}>Total Sequences</TD>
              <TD style={styles.tableCell}>{awaySeq.total}</TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>{homeSeq.over10}</TD>
              <TD style={styles.tableCellMetric}>Over 10+</TD>
              <TD style={styles.tableCell}>{awaySeq.over10}</TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>{homeSeq.btwn7to9}</TD>
              <TD style={styles.tableCellMetric}>Between 7 - 9</TD>
              <TD style={styles.tableCell}>{awaySeq.btwn7to9}</TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>{homeSeq.btwn4to6}</TD>
              <TD style={styles.tableCellMetric}>Between 4 - 6</TD>
              <TD style={styles.tableCell}>{awaySeq.btwn4to6}</TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>{homeSeq.below3}</TD>
              <TD style={styles.tableCellMetric}>Below 3</TD>
              <TD style={styles.tableCell}>{awaySeq.below3}</TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCellMetric}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCellMetric}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {homeInBoxComp} / {homeInBox}{' '}
                {getPercent(homeInBox, homeInBoxComp)}%
              </TD>
              <TD style={styles.tableCellMetric}>Attempts Inside Box</TD>
              <TD style={styles.tableCell}>
                {awayInBoxComp} / {awayInBox}{' '}
                {getPercent(awayInBox, awayInBoxComp)}%
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {homeOutBoxComp} / {homeOutBox}{' '}
                {getPercent(homeOutBox, homeOutBoxComp)}%
              </TD>
              <TD style={styles.tableCellMetric}>Attempts Outside Box</TD>
              <TD style={styles.tableCell}>
                {awayOutBoxComp} / {awayOutBox}{' '}
                {getPercent(awayOutBox, awayOutBoxComp)}%
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCellMetric}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {getSubEventCount('204', '478', stats, true) +
                  getSubEventCount('204', '479', stats, true)}
              </TD>
              <TD style={styles.tableCellMetric}>Total Recoveries</TD>
              <TD style={styles.tableCell}>
                {getSubEventCount('204', '478', stats, false) +
                  getSubEventCount('204', '479', stats, false)}
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {getSubEventCount('204', '479', stats, true) +
                  getSubEventCount('204', '479', stats, true)}
              </TD>
              <TD style={styles.tableCellMetric}>Opponent&apos;s half</TD>
              <TD style={styles.tableCell}>
                {getSubEventCount('204', '479', stats, false) +
                  getSubEventCount('204', '479', stats, false)}
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {getSubEventCount('204', '478', stats, true) +
                  getSubEventCount('204', '479', stats, true)}
              </TD>
              <TD style={styles.tableCellMetric}>Own half</TD>
              <TD style={styles.tableCell}>
                {getSubEventCount('204', '478', stats, false) +
                  getSubEventCount('204', '479', stats, false)}
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCellMetric}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCellMetric}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {getEventCount('24', stats, true)}
              </TD>
              <TD style={styles.tableCellMetric}>Saves</TD>
              <TD style={styles.tableCell}>
                {getEventCount('24', stats, false)}
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {hCompRestart} / {getEventCount('216', stats, true)}{' '}
                {getPercent(getEventCount('216', stats, true), hCompRestart)}%
              </TD>
              <TD style={styles.tableCellMetric}>Successful Restarts</TD>
              <TD style={styles.tableCell}>
                {aCompRestart} / {getEventCount('216', stats, false)}{' '}
                {getPercent(getEventCount('216', stats, false), aCompRestart)}%
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {hCompGoalkick}/ {getEventCount('239', stats, true)}{' '}
                {getPercent(getEventCount('239', stats, true), hCompRestart)}%
              </TD>
              <TD style={styles.tableCellMetric}>Successful Goalkicks</TD>
              <TD style={styles.tableCell}>
                {aCompGoalkick} / {getEventCount('239', stats, false)}{' '}
                {getPercent(getEventCount('239', stats, false), aCompGoalkick)}%
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCellMetric}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}> </TD>
              <TD style={styles.tableCellMetric}> </TD>
              <TD style={styles.tableCell}> </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {getSubEventCount('11', '74', stats, true)}
              </TD>
              <TD style={styles.tableCellMetric}>Fouls committed</TD>
              <TD style={styles.tableCell}>
                {getSubEventCount('11', '74', stats, false)}
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {getSubEventCount('5', '21', stats, true)}
              </TD>
              <TD style={styles.tableCellMetric}>Yellow cards</TD>
              <TD style={styles.tableCell}>
                {getSubEventCount('5', '21', stats, false)}
              </TD>
            </TR>

            <TR>
              <TD style={styles.tableCell}>
                {getSubEventCount('5', '22', stats, true)}
              </TD>
              <TD style={styles.tableCellMetric}>Red cards</TD>
              <TD style={styles.tableCell}>
                {getSubEventCount('5', '22', stats, false)}
              </TD>
            </TR>
          </Table>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>{formatDate}</Text>
          <Text>Improving African Lives Using Numbers</Text>
        </View>
      </Page>
    </Document>
  )
}

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandLogo: {
    width: 120,
    height: 60,
    marginBottom: 10,
  },
  matchInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
  },
  teamContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '30%',
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginRight: 6,
  },
  teamName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: brandBlue,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 4,
    color: brandBlue,
  },
  scoreSeparator: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  matchReportText: {
    fontSize: 8,
    color: '#666',
    marginTop: 5,
  },
  body: {
    flexGrow: 1,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkBlue,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    flexWrap: 'wrap',
  },
  card: {
    width: '23%',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    border: '1pt solid #ccc',
    shadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardPrimary: {
    backgroundColor: lightBlue,
    borderTopWidth: 4,
    borderTopColor: brandBlue,
  },
  cardSecondary: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 4,
    borderTopColor: '#666',
  },
  cardTertiary: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 4,
    borderTopColor: '#999',
  },
  cardQuaternary: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 4,
    borderTopColor: '#ccc',
  },
  cardTitle: {
    fontSize: 10,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'semibold',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: darkBlue,
  },
  tableContainer: {
    marginTop: 15,
  },
  tableHeader: {
    backgroundColor: lightBlue,
    color: brandBlue,
    fontSize: 9,
    fontWeight: 'bold',
    padding: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: lightBlue,
  },
  team1Header: {
    backgroundColor: lightBlue,
    borderTopLeftRadius: 4,
  },
  team2Header: {
    backgroundColor: lightBlue,
    borderTopRightRadius: 4,
  },
  tableCell: {
    fontSize: 9,
    padding: 6,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: lightBlue,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellMetric: {
    fontSize: 10,
    padding: 6,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: lightBlue,
    color: brandBlue,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: brandBlue,
    paddingTop: 3,
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
  footerDate: {
    fontWeight: 'bold',
    color: brandBlue,
  },
  footerTagline: {
    fontStyle: 'italic',
  },
})
