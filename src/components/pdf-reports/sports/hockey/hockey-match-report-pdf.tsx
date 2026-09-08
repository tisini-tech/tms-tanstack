import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import { BrandPage } from '#/components/pdf-reports/brand-page'
import type { ReportTeam } from '#/components/pdf-reports/pdf-types'
import { HockeyPlayerStatsTable } from '#/components/pdf-reports/sports/hockey/hockey-player-stats-table'
import { HockeyTeamStatsTable } from '#/components/pdf-reports/sports/hockey/hockey-team-stats-table'
import { HockeyTimelineChart } from '#/components/pdf-reports/sports/hockey/hockey-timeline-chart'
import {
  getTeamId,
  getTeamName,
  hockeyTimelineMaxMinutes,
  transformHockeyPlayerStats,
  transformHockeyTeamStats,
} from '#/components/pdf-reports/sports/hockey/hockey-metrics'
import type {
  FixturePlayerStats,
  FixtureTeamStats,
} from '#/lib/types'

export type HockeyMatchReportPDFProps = {
  teamStats: FixtureTeamStats
  playerStats: FixturePlayerStats[]
  team: ReportTeam
  /** When false, skip the player stats page (team-only mode). */
  includePlayerPage?: boolean
}

export function HockeyMatchReportPDF({
  teamStats,
  playerStats,
  team,
  includePlayerPage = true,
}: HockeyMatchReportPDFProps) {
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

  const timelineEvents = teamStats.timeline ?? []
  const maxMinutes = hockeyTimelineMaxMinutes(timelineEvents)
  const teamTable = transformHockeyTeamStats(teamStats, team)
  const playerTable = transformHockeyPlayerStats(playerStats, teamId)

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
          <Text style={styles.reportTitle}>{teamName} Hockey Match Report</Text>
          <Text style={styles.reportDate}>{matchDate}</Text>
          <View style={styles.titleLine} />
        </View>

        <View style={styles.timelineContainer}>
          <HockeyTimelineChart
            events={timelineEvents}
            teamId={teamId}
            maxMinutes={maxMinutes}
          />
        </View>
      </Page>

      <BrandPage fixture={fixture}>
        <HockeyTeamStatsTable stats={teamTable} teamName={teamName} />
      </BrandPage>

      {includePlayerPage ? (
        <BrandPage fixture={fixture}>
          <HockeyPlayerStatsTable stats={playerTable} teamName={teamName} />
        </BrandPage>
      ) : null}
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
    marginTop: 24,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 1,
  },
  brandLogo: {
    width: 110,
    height: 55,
  },
  matchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 60,
    marginTop: 8,
    marginBottom: 16,
    zIndex: 1,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogoWrapper: {
    marginBottom: 10,
  },
  teamLogoContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  teamLogo: {
    width: 48,
    height: 48,
  },
  scoreWrapper: {
    paddingHorizontal: 20,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  scoreText: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginHorizontal: 8,
  },
  scoreDivider: {
    width: 2,
    height: 30,
    backgroundColor: '#ffffff',
    opacity: 0.3,
    marginHorizontal: 4,
  },
  teamName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#1e293b',
    marginTop: 4,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    zIndex: 1,
  },
  titleLine: {
    width: 100,
    height: 2,
    backgroundColor: '#3b82f6',
    marginVertical: 6,
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#1e293b',
  },
  reportDate: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  timelineContainer: {
    marginTop: 4,
    marginHorizontal: 20,
    paddingBottom: 2,
  },
})
