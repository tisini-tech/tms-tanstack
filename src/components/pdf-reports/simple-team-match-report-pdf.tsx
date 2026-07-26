import { Document, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { FixtureTeamStats } from '#/lib/types'

import { BrandPage } from './brand-page'
import type { ReportTeam, TableData } from './pdf-types'
import {
  getTeamName,
  transformAttackingTeamStats,
  transformDefenseTeamStats,
} from './transform-report-data'

interface SimpleTeamMatchReportPDFProps {
  teamStats: FixtureTeamStats
  team: ReportTeam
}

function StatsSection({ title, stats }: { title: string; stats: TableData }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.eventColumn]}>Event</Text>
          <Text style={[styles.tableHeaderCell, styles.statsColumn]}>Stats</Text>
          <Text style={[styles.tableHeaderCell, styles.accColumn]}>Acc.</Text>
        </View>
        {Object.entries(stats).map(([key, value]) => {
          if (typeof value === 'string') {
            return <View key={key} style={styles.separatorRow} />
          }

          const statsValue =
            typeof value.stats === 'number' ? String(value.stats) : value.stats
          const accValue =
            typeof value.acc === 'number' ? `${value.acc}%` : value.acc || ''

          return (
            <View key={key} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.eventColumn]}>{key}</Text>
              <Text style={[styles.tableCell, styles.statsColumn]}>
                {statsValue}
              </Text>
              <Text style={[styles.tableCell, styles.accColumn]}>{accValue}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export function SimpleTeamMatchReportPDF({
  teamStats,
  team,
}: SimpleTeamMatchReportPDFProps) {
  const fixture = teamStats.fixture
  const teamName = getTeamName(teamStats, team)
  const attacking = transformAttackingTeamStats(teamStats, team)
  const defense = transformDefenseTeamStats(teamStats, team)

  return (
    <Document>
      <BrandPage fixture={fixture}>
        <View style={styles.container}>
          <Text style={styles.title}>{teamName} Team Report</Text>
          <Text style={styles.subtitle}>Player stats unavailable for this fixture</Text>
          <StatsSection title="Attacking" stats={attacking} />
          <StatsSection title="Defensive" stats={defense} />
        </View>
      </BrandPage>
    </Document>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 8,
    paddingTop: 4,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 2,
  },
  section: {
    flex: 1,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  table: {
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
    minHeight: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: 8,
    color: '#1e293b',
    paddingVertical: 4,
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
