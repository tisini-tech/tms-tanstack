import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import type {
  FixturePassMatrix,
  FixturePlayerStats,
  FixtureTeamStats,
} from '#/lib/types'

import { BrandPage } from './brand-page'
import type { TeamChartImages } from '#/lib/charts/team-quarter-types'
import { PassMatrixTable } from './pass-matrix-table'
import { PlayerChartsPages } from './player-charts-pages'
import { PlayerStatsTable } from './player-stats-table'
import type { ReportTeam } from './pdf-types'
import { TeamStatsTable } from './team-stats-view'
import { TimelineChart } from './timeline-chart'
import {
  filterTimelineForTeam,
  getPassMatrixForTeam,
  getTeamId,
  getTeamName,
  transformAttackingTeamStats,
  transformDefenseTeamStats,
  transformPlayerAttackingStats,
  transformPlayerDefensiveStats,
  transformPlayerGoalkeepingStats,
} from './transform-report-data'

export interface MatchReportPDFProps {
  teamStats: FixtureTeamStats
  playerStats: FixturePlayerStats[]
  passMatrix: FixturePassMatrix
  team: ReportTeam
  teamCharts: TeamChartImages
  playerCharts: Record<string, string>
}

export function MatchReportPDF({
  teamStats,
  playerStats,
  passMatrix,
  team,
  teamCharts,
  playerCharts,
}: MatchReportPDFProps) {
  const fixture = teamStats.fixture
  const teamId = getTeamId(teamStats, team)
  const teamName = getTeamName(teamStats, team)

  const homeTeam = fixture.home_team || 'Home Team'
  const awayTeam = fixture.away_team || 'Away Team'
  const homeLogo = fixture.home_logo || '/homeLogo.png'
  const awayLogo = fixture.away_logo || '/awayLogo.png'

  const matchDate = fixture.match_date
    ? new Date(fixture.match_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString()

  const timelineEvents = filterTimelineForTeam(teamStats.timeline, teamId)
  const maxMinutes =
    timelineEvents.reduce(
      (max, event) => Math.max(max, event.game_minute || 0),
      90,
    ) || 90

  const attacking = transformAttackingTeamStats(teamStats, team)
  const defense = transformDefenseTeamStats(teamStats, team)
  const playerAttackingStats = transformPlayerAttackingStats(
    playerStats,
    teamId,
  )
  const playerDefensiveStats = transformPlayerDefensiveStats(
    playerStats,
    teamId,
  )
  const playerGoalkeepingStats = transformPlayerGoalkeepingStats(
    playerStats,
    teamId,
  )
  const teamPassMatrix = getPassMatrixForTeam(passMatrix, team)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.backgroundDecorations}>
          <View style={styles.topAccent} />
          <View style={styles.bottomAccent} />
        </View>

        <View style={styles.logoContainer}>
          <Image src="/tisini.png" style={styles.brandLogo} />
        </View>

        <View style={styles.matchInfoContainer}>
          <View style={styles.teamSection}>
            <View style={styles.teamLogoWrapper}>
              <View style={styles.teamLogoContainer}>
                <Image src={homeLogo} style={styles.teamLogo} />
              </View>
            </View>
            <Text style={styles.teamName}>{homeTeam}</Text>
          </View>

          <View style={styles.scoreWrapper}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>{fixture.home_score || 0}</Text>
              <View style={styles.scoreDivider} />
              <Text style={styles.scoreText}>{fixture.away_score || 0}</Text>
            </View>
          </View>

          <View style={styles.teamSection}>
            <View style={styles.teamLogoWrapper}>
              <View style={styles.teamLogoContainer}>
                <Image src={awayLogo} style={styles.teamLogo} />
              </View>
            </View>
            <Text style={styles.teamName}>{awayTeam}</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.titleLine} />
          <Text style={styles.reportTitle}>{teamName} Match Report</Text>
          <Text style={styles.reportDate}>{matchDate}</Text>
          <View style={styles.titleLine} />
        </View>

        <View style={styles.timelineContainer}>
          <TimelineChart
            events={timelineEvents}
            teamId={teamId}
            maxMinutes={maxMinutes}
          />
        </View>
      </Page>

      <BrandPage fixture={fixture}>
        <View style={styles.pageContainer}>
          <TeamStatsTable stats={attacking} />
          <View style={styles.rightSection}>
            <View style={styles.chartsSection}>
              <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Shots</Text>
                <View style={styles.chartPlaceholder}>
                  {teamCharts.shots ? (
                    <Image src={teamCharts.shots} style={styles.chartImage} />
                  ) : null}
                </View>
              </View>

              <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Chances</Text>
                <View style={styles.chartPlaceholder}>
                  {teamCharts.chances ? (
                    <Image src={teamCharts.chances} style={styles.chartImage} />
                  ) : null}
                </View>
              </View>
            </View>
            <View style={styles.playerStatsSection}>
              <PlayerStatsTable stats={playerAttackingStats} col="attacking" />
            </View>
          </View>
        </View>
      </BrandPage>

      <BrandPage fixture={fixture}>
        <View style={styles.pageContainer}>
          <TeamStatsTable stats={defense} />
          <View style={styles.rightSection}>
            <View style={styles.chartsSection}>
              <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Defensive</Text>
                <View style={styles.chartPlaceholder}>
                  {teamCharts.defense ? (
                    <Image src={teamCharts.defense} style={styles.chartImage} />
                  ) : null}
                </View>
              </View>

              <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Passing</Text>
                <View style={styles.chartPlaceholder}>
                  {teamCharts.possession ? (
                    <Image
                      src={teamCharts.possession}
                      style={styles.chartImage}
                    />
                  ) : null}
                </View>
              </View>
            </View>
            <View style={styles.playerStatsSection}>
              <PlayerStatsTable stats={playerDefensiveStats} col="defensive" />
            </View>
          </View>
        </View>
      </BrandPage>

      <BrandPage fixture={fixture}>
        <View style={styles.passMatrixContainer}>
          <View style={styles.goalkeepingSection}>
            <PlayerStatsTable
              stats={playerGoalkeepingStats}
              col="goalkeeping"
            />
          </View>
          <View style={styles.passMatrixSection}>
            <PassMatrixTable passMatrix={teamPassMatrix} />
          </View>
        </View>
      </BrandPage>

      <PlayerChartsPages fixture={fixture} playerCharts={playerCharts} />
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  backgroundDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#1e40af',
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#3b82f6',
  },
  logoContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 25,
    zIndex: 1,
  },
  brandLogo: {
    width: 120,
    height: 60,
  },
  matchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 60,
    marginTop: 15,
    marginBottom: 30,
    zIndex: 1,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogoWrapper: {
    marginBottom: 12,
  },
  teamLogoContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  teamLogo: {
    width: 55,
    height: 55,
  },
  scoreWrapper: {
    paddingHorizontal: 25,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 8,
  },
  scoreDivider: {
    width: 2,
    height: 35,
    backgroundColor: '#ffffff',
    opacity: 0.3,
    marginHorizontal: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginTop: 4,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    zIndex: 1,
  },
  titleLine: {
    width: 100,
    height: 2,
    backgroundColor: '#3b82f6',
    marginVertical: 8,
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  reportDate: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  timelineContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingBottom: 5,
  },
  pageContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  rightSection: {
    width: '75%',
    paddingLeft: 10,
    flexDirection: 'column',
    gap: 10,
    height: '100%',
  },
  chartsSection: {
    height: '30%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  chartWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
    textAlign: 'center',
  },
  chartPlaceholder: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chartImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  playerStatsSection: {
    height: '70%',
    flex: 1,
  },
  passMatrixContainer: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  goalkeepingSection: {
    flex: 1,
    marginBottom: 15,
    maxHeight: '40%',
  },
  passMatrixSection: {
    flex: 1,
    minHeight: '55%',
  },
})
