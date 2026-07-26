import { useEffect, useRef, useState } from 'react'

import {
  calculateYAxisMax,
  generatePlayerPerformanceChart,
  type AverageQuarterStats,
  type PlayerQuarterStat,
} from '#/lib/charts/generate-player-chart'

export function usePlayerCharts(
  playerQuarterStats: PlayerQuarterStat[],
  averageQuarterStats: AverageQuarterStats,
) {
  const [isGeneratingPlayerCharts, setIsGeneratingPlayerCharts] =
    useState(false)
  const [playerChartsError, setPlayerChartsError] = useState<string | null>(
    null,
  )
  const [playerCharts, setPlayerCharts] = useState<Record<string, string>>({})

  const hasGeneratedPlayerChartsRef = useRef(false)
  const playerChartsKeyRef = useRef('')
  const isGeneratingRef = useRef(false)

  useEffect(() => {
    const generatePlayerCharts = async () => {
      const hasPlayerStats = playerQuarterStats.length > 0
      const hasAverageStats = Object.keys(averageQuarterStats).length > 0
      const playerChartsKey = JSON.stringify({
        players: playerQuarterStats,
        average: averageQuarterStats,
      })

      if (
        !hasPlayerStats ||
        !hasAverageStats ||
        isGeneratingRef.current ||
        (hasGeneratedPlayerChartsRef.current &&
          playerChartsKeyRef.current === playerChartsKey)
      ) {
        return
      }

      isGeneratingRef.current = true

      hasGeneratedPlayerChartsRef.current = true
      playerChartsKeyRef.current = playerChartsKey
      setIsGeneratingPlayerCharts(true)
      setPlayerChartsError(null)

      try {
        const charts: Record<string, string> = {}
        const yAxisMax = calculateYAxisMax(
          playerQuarterStats,
          averageQuarterStats,
        )

        for (const player of playerQuarterStats) {
          const chartImage = await generatePlayerPerformanceChart(
            player,
            averageQuarterStats,
            yAxisMax,
          )
          charts[player.name.trim()] = chartImage
        }

        setPlayerCharts(charts)
      } catch (error) {
        console.error('Error generating player charts:', error)
        setPlayerChartsError(
          error instanceof Error
            ? error.message
            : 'Failed to generate player charts',
        )
        hasGeneratedPlayerChartsRef.current = false
      } finally {
        isGeneratingRef.current = false
        setIsGeneratingPlayerCharts(false)
      }
    }

    void generatePlayerCharts()
  }, [averageQuarterStats, playerQuarterStats])

  return {
    playerCharts,
    isGeneratingPlayerCharts,
    playerChartsError,
  }
}
