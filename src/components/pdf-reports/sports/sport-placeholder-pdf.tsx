import { Document, StyleSheet, Text, View } from '@react-pdf/renderer'

import { BrandPage } from '#/components/pdf-reports/brand-page'
import type { SimpleFixture } from '#/lib/types'

type SportPlaceholderPDFProps = {
  fixture: SimpleFixture
  sportLabel: string
  reportKind: 'match' | 'player'
  teamName?: string
  playerName?: string
  isLandscape?: boolean
}

export function SportPlaceholderPDF({
  fixture,
  sportLabel,
  reportKind,
  teamName,
  playerName,
  isLandscape = true,
}: SportPlaceholderPDFProps) {
  const matchType = fixture.match_type?.trim() || sportLabel

  return (
    <Document>
      <BrandPage fixture={fixture} isLandscape={isLandscape}>
        <View style={styles.container}>
          <Text style={styles.eyebrow}>Report shell</Text>
          <Text style={styles.title}>{sportLabel} report</Text>
          <Text style={styles.subtitle}>
            {reportKind === 'match' ? 'Match report' : 'Player report'} placeholder
          </Text>

          <View style={styles.card}>
            <Row label="Fixture type" value={matchType} />
            <Row label="Sport" value={sportLabel} />
            <Row
              label="Fixture"
              value={`${fixture.home_team} vs ${fixture.away_team}`}
            />
            <Row label="Matchday" value={fixture.matchday || '—'} />
            {teamName ? <Row label="Team" value={teamName} /> : null}
            {playerName ? <Row label="Player" value={playerName} /> : null}
          </View>

          <Text style={styles.note}>
            Full {sportLabel.toLowerCase()} analytics for this report type are
            not implemented yet. Football reports remain fully available.
          </Text>
        </View>
      </BrandPage>
    </Document>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f8fafc',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  rowValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'right',
    flexGrow: 1,
    flexShrink: 1,
  },
  note: {
    marginTop: 20,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#64748b',
  },
})
