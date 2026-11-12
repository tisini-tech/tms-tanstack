import { useEffect, useMemo, useRef, useState } from 'react'

import type { MatchMetric, MetricCategory, TeamLineup, Zone } from '#/lib/types'
import {
  OTHER_CATEGORY,
  PLAYER_KEYS,
  SUBSTITUTE_METRIC_IDS,
  byOrder,
  isSubRole,
  shortcutIndex,
  type ColumnKey,
} from '#/components/collection/utils'

type UseSelectionControlsArgs = {
  open: boolean
  metrics: MatchMetric[]
  metricCategories: MetricCategory[]
  lineups: TeamLineup[]
  zones: Zone[]
}

export function useSelectionControls({
  open,
  metrics,
  metricCategories,
  lineups,
  zones,
}: UseSelectionControlsArgs) {
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [focusColumn, setFocusColumn] = useState<ColumnKey>('category')
  const [metricId, setMetricId] = useState<number | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [subDetailId, setSubDetailId] = useState<number | null>(null)
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [subPlayerId, setSubPlayerId] = useState<number | null>(null)
  const [zoneId, setZoneId] = useState<number | null>(null)

  const categories = useMemo(
    () =>
      [...metricCategories]
        .filter((category) => category.status !== 0)
        .sort((a, b) => a.ranker - b.ranker || a.name.localeCompare(b.name)),
    [metricCategories],
  )
  const activeMetrics = useMemo(
    () => byOrder(metrics.filter((metric) => metric.is_active !== 0)),
    [metrics],
  )
  const categoryOptions = useMemo(() => {
    const options = categories.map((category) => ({
      id: category.id,
      name: category.name,
    }))
    if (options.length === 0) return options
    const known = new Set(options.map((category) => category.id))
    if (activeMetrics.some((metric) => !known.has(metric.metric_category))) {
      options.push({ id: OTHER_CATEGORY, name: 'Other' })
    }
    return options
  }, [activeMetrics, categories])
  const metricList = useMemo(() => {
    if (categoryOptions.length === 0) return activeMetrics
    if (categoryId == null) return []
    if (categoryId === OTHER_CATEGORY) {
      const known = new Set(categories.map((category) => category.id))
      return activeMetrics.filter(
        (metric) => !known.has(metric.metric_category),
      )
    }
    return activeMetrics.filter(
      (metric) => metric.metric_category === categoryId,
    )
  }, [activeMetrics, categories, categoryId, categoryOptions.length])
  const metric = metricList.find((item) => item.id === metricId)
  const details = byOrder(metric?.details ?? [])
  const detail = details.find((item) => item.id === detailId)
  const subDetails = byOrder(metric?.sub_details ?? [])
  const subDetail = subDetails.find((item) => item.id === subDetailId)
  const squad = useMemo(
    () =>
      [...lineups].sort((a, b) => {
        const aSub = isSubRole(a.role) ? 1 : 0
        const bSub = isSubRole(b.role) ? 1 : 0
        if (aSub !== bSub) return aSub - bSub
        return a.lineup_position - b.lineup_position
      }),
    [lineups],
  )
  const starters = useMemo(
    () => squad.filter((entry) => !isSubRole(entry.role)),
    [squad],
  )
  const substitutes = useMemo(
    () => squad.filter((entry) => isSubRole(entry.role)),
    [squad],
  )
  const showSubs = SUBSTITUTE_METRIC_IDS.has(metricId ?? -1)
  const player = squad.find((entry) => entry.id === playerId)
  const subPlayer = squad.find((entry) => entry.id === subPlayerId)
  const columns = useMemo(() => {
    const next: ColumnKey[] = []
    if (categoryOptions.length > 0) next.push('category')
    next.push('metric')
    if (details.length > 0) next.push('detail')
    if (subDetails.length > 0) next.push('subdetail')
    if (zones.length > 0) next.push('zone')
    if (starters.length > 0) next.push('player')
    if (showSubs && substitutes.length > 0) next.push('bench')
    return next
  }, [
    categoryOptions.length,
    details.length,
    showSubs,
    starters.length,
    subDetails.length,
    substitutes.length,
    zones.length,
  ])
  const focus = columns.includes(focusColumn)
    ? focusColumn
    : (columns[0] ?? 'metric')

  function hotkeyFor(column: ColumnKey, index: number) {
    if (focus !== column) return undefined
    const letters = column === 'player' || column === 'bench'
    const key = letters
      ? PLAYER_KEYS[index]
      : index < 9
        ? String(index + 1)
        : ''
    return key ? key.toUpperCase() : undefined
  }

  function afterPlayers(): ColumnKey | null {
    if (starters.length > 0) return 'player'
    if (showSubs && substitutes.length > 0) return 'bench'
    return null
  }

  function afterMetric(item: MatchMetric | undefined): ColumnKey {
    if (byOrder(item?.details ?? []).length > 0) return 'detail'
    if (byOrder(item?.sub_details ?? []).length > 0) return 'subdetail'
    if (zones.length > 0) return 'zone'
    return afterPlayers() ?? 'metric'
  }

  function listLength(column: ColumnKey) {
    if (column === 'category') return categoryOptions.length
    if (column === 'metric') return metricList.length
    if (column === 'detail') return details.length
    if (column === 'subdetail') return subDetails.length
    if (column === 'zone') return zones.length
    if (column === 'player') return starters.length
    return substitutes.length
  }

  function selectedIndex(column: ColumnKey) {
    if (column === 'category') {
      return categoryOptions.findIndex((item) => item.id === categoryId)
    }
    if (column === 'metric') {
      return metricList.findIndex((item) => item.id === metricId)
    }
    if (column === 'detail') {
      return details.findIndex((item) => item.id === detailId)
    }
    if (column === 'subdetail') {
      return subDetails.findIndex((item) => item.id === subDetailId)
    }
    if (column === 'zone') {
      return zones.findIndex((item) => item.id === zoneId)
    }
    if (column === 'player') {
      return starters.findIndex((item) => item.id === playerId)
    }
    return substitutes.findIndex((item) => item.id === subPlayerId)
  }

  function chooseCategory(id: number) {
    setCategoryId(id)
    setMetricId(null)
    setDetailId(null)
    setSubDetailId(null)
    setSubPlayerId(null)
    setFocusColumn('metric')
  }

  function chooseMetric(id: number) {
    const item = metricList.find((metric) => metric.id === id)
    setMetricId(id)
    setDetailId(null)
    setSubDetailId(null)
    if (!SUBSTITUTE_METRIC_IDS.has(id)) setSubPlayerId(null)
    setFocusColumn(afterMetric(item))
  }

  function chooseDetail(id: number) {
    setDetailId(id)
    if (subDetails.length > 0) setFocusColumn('subdetail')
    else if (zones.length > 0) setFocusColumn('zone')
    else {
      const next = afterPlayers()
      if (next) setFocusColumn(next)
    }
  }

  function chooseSubDetail(id: number) {
    setSubDetailId(id)
    if (zones.length > 0) setFocusColumn('zone')
    else {
      const next = afterPlayers()
      if (next) setFocusColumn(next)
    }
  }

  function chooseZone(id: number) {
    setZoneId(id)
    const next = afterPlayers()
    if (next) setFocusColumn(next)
  }

  function chooseStarter(entry: TeamLineup, advance: boolean) {
    setPlayerId(playerId === entry.id ? null : entry.id)
    if (advance && showSubs && substitutes.length > 0) setFocusColumn('bench')
  }

  function chooseBench(entry: TeamLineup) {
    setSubPlayerId(subPlayerId === entry.id ? null : entry.id)
  }

  function pick(index: number) {
    if (focus === 'category') {
      const category = categoryOptions[index]
      if (category) chooseCategory(category.id)
      return
    }
    if (focus === 'metric') {
      const item = metricList[index]
      if (item) chooseMetric(item.id)
      return
    }
    if (focus === 'detail') {
      const item = details[index]
      if (item) chooseDetail(item.id)
      return
    }
    if (focus === 'subdetail') {
      const item = subDetails[index]
      if (item) chooseSubDetail(item.id)
      return
    }
    if (focus === 'zone') {
      const item = zones[index]
      if (item) chooseZone(item.id)
      return
    }
    if (focus === 'player') {
      const entry = starters[index]
      if (entry) chooseStarter(entry, true)
      return
    }
    const entry = substitutes[index]
    if (entry) chooseBench(entry)
  }

  function move(direction: 1 | -1) {
    const current = Math.max(0, columns.indexOf(focus))
    const next = columns[current + direction]
    if (next) setFocusColumn(next)
  }

  function step(direction: 1 | -1) {
    const length = listLength(focus)
    if (length === 0) return
    const current = selectedIndex(focus)
    const next =
      current < 0 ? (direction > 0 ? 0 : length - 1) : current + direction
    if (next < 0 || next >= length) return
    if (focus === 'category') {
      const category = categoryOptions[next]
      if (!category) return
      setCategoryId(category.id)
      setMetricId(null)
      setDetailId(null)
      setSubDetailId(null)
      setSubPlayerId(null)
      return
    }
    if (focus === 'metric') {
      const item = metricList[next]
      if (!item) return
      setMetricId(item.id)
      setDetailId(null)
      setSubDetailId(null)
      if (!SUBSTITUTE_METRIC_IDS.has(item.id)) setSubPlayerId(null)
      return
    }
    if (focus === 'detail') {
      const item = details[next]
      if (item) setDetailId(item.id)
      return
    }
    if (focus === 'subdetail') {
      const item = subDetails[next]
      if (item) setSubDetailId(item.id)
      return
    }
    if (focus === 'zone') {
      const item = zones[next]
      if (item) setZoneId(item.id)
      return
    }
    if (focus === 'player') {
      const entry = starters[next]
      if (entry) setPlayerId(entry.id)
      return
    }
    const entry = substitutes[next]
    if (entry) setSubPlayerId(entry.id)
  }

  function tryKey(key: string) {
    const letters = focus === 'player' || focus === 'bench'
    const index = shortcutIndex(key, letters)
    if (index == null || index >= listLength(focus)) return false
    pick(index)
    return true
  }

  function reset() {
    setCategoryId(null)
    setMetricId(null)
    setDetailId(null)
    setSubDetailId(null)
    setPlayerId(null)
    setSubPlayerId(null)
    setZoneId(null)
    setFocusColumn('category')
  }

  const actionsRef = useRef({
    move: (_direction: 1 | -1) => {},
    step: (_direction: 1 | -1) => {},
    tryKey: (_key: string): boolean => false,
    saveAnother: () => {},
    saveAndTag: () => {},
  })
  actionsRef.current.move = move
  actionsRef.current.step = step
  actionsRef.current.tryKey = tryKey

  useEffect(() => {
    if (!open) return

    const popup = document.querySelector<HTMLElement>(
      '[data-slot="dialog-content"]',
    )
    const active = document.activeElement
    if (
      popup &&
      active instanceof HTMLElement &&
      popup.contains(active) &&
      active.closest('select')
    ) {
      popup.tabIndex = -1
      popup.focus()
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        actionsRef.current.move(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        actionsRef.current.move(-1)
        return
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (target instanceof HTMLElement && target.closest('select')) return
        event.preventDefault()
        actionsRef.current.step(event.key === 'ArrowDown' ? 1 : -1)
        return
      }
      if (
        !event.repeat &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        actionsRef.current.tryKey(event.key)
      ) {
        event.preventDefault()
        return
      }
      if (
        event.key === 'Enter' &&
        !event.repeat &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault()
        event.stopPropagation()
        actionsRef.current.saveAndTag()
        return
      }
      if (
        (event.key === 'n' || event.key === 'N') &&
        !event.repeat &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault()
        actionsRef.current.saveAnother()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const selected = document.querySelector<HTMLElement>(
      `[data-slot="dialog-content"] [data-column="${focus}"][data-selected="true"]`,
    )
    selected?.scrollIntoView({ block: 'nearest' })
  }, [
    open,
    focus,
    categoryId,
    metricId,
    detailId,
    subDetailId,
    zoneId,
    playerId,
    subPlayerId,
  ])

  return {
    categoryOptions,
    metricList,
    details,
    subDetails,
    starters,
    substitutes,
    showSubs,
    focus,
    categoryId,
    metricId,
    detailId,
    subDetailId,
    zoneId,
    playerId,
    subPlayerId,
    metric,
    detail,
    subDetail,
    player,
    subPlayer,
    hotkeyFor,
    chooseCategory,
    chooseMetric,
    chooseDetail,
    chooseSubDetail,
    chooseZone,
    chooseStarter,
    chooseBench,
    reset,
    actionsRef,
  }
}
