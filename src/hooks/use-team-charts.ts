import { useEffect, useRef, useState } from 'react'

import { generateLineChart } from '#/lib/charts/generate-line-chart'
import { generateShotsChartImage } from '#/lib/charts/generate-shots-chart'
import type {
  ChartTeamQuarterStats,
  TeamChartImages,
} from '#/lib/charts/team-quarter-types'

export function useTeamCharts(quarterStats: ChartTeamQuarterStats) {
  const [isGeneratingChart, setIsGeneratingChart] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [teamCharts, setTeamCharts] = useState<Partial<TeamChartImages>>({})

  const hasGeneratedRef = useRef(false)
  const quarterStatsKeyRef = useRef('')
  const isGeneratingRef = useRef(false)

  useEffect(() => {
    const generateChart = async () => {
      const hasQuarterStats = Object.keys(quarterStats).length > 0
      const quarterStatsKey = JSON.stringify(quarterStats)

      if (
        !hasQuarterStats ||
        isGeneratingRef.current ||
        (hasGeneratedRef.current && quarterStatsKeyRef.current === quarterStatsKey)
      ) {
        return
      }

      isGeneratingRef.current = true
      hasGeneratedRef.current = true
      quarterStatsKeyRef.current = quarterStatsKey
      setIsGeneratingChart(true)
      setChartError(null)

      try {
        const shotsImage = await generateShotsChartImage(quarterStats)
        const chancesImage = await generateLineChart(quarterStats, 'chances')
        const possessionImage = await generateLineChart(
          quarterStats,
          'completePasses',
        )
        const defenseImage = await generateLineChart(
          quarterStats,
          'defensiveActions',
        )

        setTeamCharts({
          shots: shotsImage,
          chances: chancesImage,
          possession: possessionImage,
          defense: defenseImage,
        })
      } catch (error) {
        console.error('Error generating chart image:', error)
        setChartError(
          error instanceof Error ? error.message : 'Failed to generate chart',
        )
        hasGeneratedRef.current = false
      } finally {
        isGeneratingRef.current = false
        setIsGeneratingChart(false)
      }
    }

    void generateChart()
  }, [quarterStats])

  return {
    teamCharts,
    isGeneratingChart,
    chartError,
  }
}
