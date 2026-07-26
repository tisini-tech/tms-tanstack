import { Document, Image, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { SimpleFixture } from '#/lib/types'

import { BrandPage } from '../brand-page'
import { formatStatDisplay } from '../format-stat-display'
import { PlayerStatsTable } from '../player-stats-table'
import type { PlayerTableRow } from '../pdf-types'

interface PlayerReportPDFProps {
  fixture: SimpleFixture
  playerChart: string
  playerName: string
  teamName: string
  position?: string
  jerseyNumber: number
  minutesPlayed: number
  rating: number
  photoUrl?: string
  attackingStats: PlayerTableRow
  defensiveStats: PlayerTableRow
  goalkeepingStats: PlayerTableRow
}

const PROFILE_CARD_HEIGHT = 100
const CHART_HEIGHT = 250
/** A4 portrait usable height minus brand header, footer, and page padding */
const PAGE_CONTENT_HEIGHT = 757
const SKIP_STAT_KEYS = new Set(['Player name', 'rating', 'mins'])

type StatRow = { label: string; value: string }

function formatStatLabel(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function playerRowToStatRows(row: PlayerTableRow): StatRow[] {
  return Object.entries(row)
    .filter(([key]) => !SKIP_STAT_KEYS.has(key))
    .map(([label, value]) => ({
      label: formatStatLabel(label),
      value: formatStatDisplay(value),
    }))
}

function PlayerStatsSection({
  title,
  rows,
}: {
  title: string
  rows: StatRow[]
}) {
  return (
    <View style={styles.statsSection}>
      <View style={styles.statsSectionHeader}>
        <Text style={styles.statsSectionTitle}>{title}</Text>
      </View>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[
            styles.statsRow,
            index % 2 === 1 ? styles.statsRowAlt : styles.statsRowEven,
          ]}
        >
          <Text style={styles.statsLabel}>{row.label}</Text>
          <Text style={styles.statsValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  )
}

export function PlayerReportPDF({
  fixture,
  playerChart,
  playerName,
  teamName,
  jerseyNumber,
  minutesPlayed,
  rating,
  photoUrl,
  attackingStats,
  defensiveStats,
  goalkeepingStats,
}: PlayerReportPDFProps) {
  const ratingDisplay =
    typeof rating === 'number' ? rating.toFixed(1) : String(rating)

  const attackingRows = playerRowToStatRows(attackingStats)
  const defensiveRows = playerRowToStatRows(defensiveStats)

  return (
    <Document>
      <BrandPage fixture={fixture} isLandscape={false} isPageNumber={false}>
        <View style={styles.pageLayout}>
          <View style={styles.header}>
            <View style={styles.profileCard}>
            <View style={styles.profileLeft}>
              <View style={styles.jerseyCircle}>
                {photoUrl ? (
                  <Image src={photoUrl} style={styles.photo} />
                ) : null}
                <View
                  style={photoUrl ? styles.jerseyOverlay : styles.jerseyFill}
                >
                  <Text
                    style={
                      photoUrl
                        ? styles.jerseyNumberSmall
                        : styles.jerseyNumberLarge
                    }
                  >
                    {jerseyNumber}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.playerName}>{playerName}</Text>
                <Text style={styles.teamName}>{teamName}</Text>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>position</Text>
                </View>
              </View>
            </View>

            <View style={styles.profileRight}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Mins</Text>
                <Text style={styles.statValue}>{minutesPlayed}</Text>
              </View>
              <View style={[styles.statCard, styles.ratingCard]}>
                <Text style={[styles.statLabel, styles.ratingLabel]}>
                  Rating
                </Text>
                <Text style={styles.ratingValue}>{ratingDisplay}</Text>
              </View>
            </View>
          </View>
        </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Performance by quarter</Text>
            <Image src={playerChart} style={styles.chartImage} />
          </View>

          <View style={styles.bodyTop}>
            <View style={styles.bodyColumn}>
              <PlayerStatsSection title="Attacking" rows={attackingRows} />
            </View>
            <View style={styles.bodyColumn}>
              <PlayerStatsSection title="Defensive" rows={defensiveRows} />
            </View>
          </View>

          <View style={styles.bodyGk}>
            <View style={styles.statsSection}>
              <View style={styles.statsSectionHeader}>
                <Text style={styles.statsSectionTitle}>Goalkeeping</Text>
              </View>
              <PlayerStatsTable
                stats={[goalkeepingStats]}
                col="goalkeeping"
                compact
                neutralHeader
                hidePlayerName
                hideRating
              />
            </View>
          </View>
        </View>
      </BrandPage>
    </Document>
  )
}

const styles = StyleSheet.create({
  pageLayout: {
    minHeight: PAGE_CONTENT_HEIGHT,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
  },
  profileCard: {
    width: '100%',
    height: PROFILE_CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    borderLeftWidth: 3,
    borderLeftColor: '#1e40af',
  },
  profileLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jerseyCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1e40af',
    backgroundColor: '#1e40af',
    position: 'relative',
    flexShrink: 0,
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  jerseyFill: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e40af',
  },
  jerseyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e40af',
  },
  jerseyNumberLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  jerseyNumberSmall: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  playerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
    lineHeight: 1.15,
  },
  teamName: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 3,
  },
  positionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  positionText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1e40af',
    textTransform: 'uppercase',
  },
  statCard: {
    width: 56,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCard: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  statLabel: {
    fontSize: 6,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ratingLabel: {
    color: '#bfdbfe',
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chartCard: {
    width: '100%',
    height: CHART_HEIGHT,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 2,
    paddingTop: 3,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 1,
  },
  chartImage: {
    width: '100%',
    height: CHART_HEIGHT - 14,
    objectFit: 'contain',
  },
  bodyTop: {
    flexDirection: 'row',
    gap: 14,
  },
  bodyColumn: {
    flex: 1,
  },
  bodyGk: {
    width: '100%',
  },
  statsSection: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statsSectionHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  statsSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsRowAlt: {
    backgroundColor: '#f8fafc',
  },
  statsRowEven: {
    backgroundColor: '#ffffff',
  },
  statsLabel: {
    width: '55%',
    fontSize: 9,
    color: '#334155',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  statsValue: {
    width: '45%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingVertical: 7,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
})
