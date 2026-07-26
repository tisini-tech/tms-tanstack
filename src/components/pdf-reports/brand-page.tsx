import { Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { SimpleFixture } from '#/lib/types'

interface BrandPageProps {
  isLandscape?: boolean
  isPageNumber?: boolean
  fixture: SimpleFixture
  children: React.ReactNode
}

export function BrandPage({
  isLandscape = true,
  isPageNumber = true,
  fixture,
  children,
}: BrandPageProps) {
  const homeTeam = fixture.home_team || 'Home Team'
  const awayTeam = fixture.away_team || 'Away Team'

  return (
    <Page
      size="A4"
      orientation={isLandscape ? 'landscape' : 'portrait'}
      style={styles.page}
    >
      <View style={styles.pageHeader} fixed>
        <View style={styles.headerContent}>
          <Image src="/tisini.png" style={styles.headerLogo} />
          <Text style={styles.headerScore}>
            {homeTeam} {fixture.home_score || 0} - {fixture.away_score || 0}{' '}
            {awayTeam}
          </Text>
        </View>
      </View>

      <View style={styles.pageFooter} fixed>
        <View style={styles.footerContent}>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              isPageNumber
                ? `Page ${pageNumber}${totalPages > 1 ? ` of ${totalPages}` : ''}`
                : 'Player Report'
            }
          />

          <Text style={styles.footerMission}>
            Improving African Lives Using Numbers
          </Text>
        </View>
      </View>

      <View style={styles.pageContent}>{children}</View>
    </Page>
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
  pageHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: '#1e40af',
    paddingHorizontal: 25,
    paddingVertical: 8,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 5,
    paddingRight: 5,
  },
  headerLogo: {
    width: 60,
    height: 30,
  },
  headerScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pageFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 25,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 5,
    zIndex: 100,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  pageNumber: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'normal',
  },
  footerMission: {
    fontSize: 10,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  pageContent: {
    marginTop: 35,
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
})
