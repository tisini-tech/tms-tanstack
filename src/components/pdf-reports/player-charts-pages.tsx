import { Image, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { SimpleFixture } from '#/lib/types'

import { BrandPage } from './brand-page'

const PLAYERS_PER_PAGE = 16

function chunkEntries(
  charts: Record<string, string>,
  size: number,
): Array<Array<[string, string]>> {
  const entries = Object.entries(charts).filter(([, chartImage]) => chartImage)
  const pages: Array<Array<[string, string]>> = []

  for (let index = 0; index < entries.length; index += size) {
    pages.push(entries.slice(index, index + size))
  }

  return pages
}

interface PlayerChartsPagesProps {
  fixture: SimpleFixture
  playerCharts: Record<string, string>
}

export function PlayerChartsPages({
  fixture,
  playerCharts,
}: PlayerChartsPagesProps) {
  const pages = chunkEntries(playerCharts, PLAYERS_PER_PAGE)

  if (!pages.length) {
    return null
  }

  return (
    <>
      {pages.map((pageCharts, pageIndex) => (
        <BrandPage key={`player-charts-${pageIndex}`} fixture={fixture}>
          <View style={styles.playerChartsContainer}>
            {pageCharts.map(([playerName, chartImage]) => (
              <View key={playerName} style={styles.playerChartWrapper}>
                <Text style={styles.playerChartTitle}>{playerName}</Text>
                <View style={styles.playerChartImageContainer}>
                  <Image src={chartImage} style={styles.playerChartImage} />
                </View>
              </View>
            ))}
          </View>
        </BrandPage>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  playerChartsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
    gap: 0,
  },
  playerChartWrapper: {
    width: '25%',
    height: '25%',
    padding: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  playerChartImageContainer: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
  },
  playerChartImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  playerChartTitle: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 1,
    textAlign: 'center',
    height: 8,
    overflow: 'hidden',
    padding: 0,
  },
})
