import { StyleSheet, Text, View } from '@react-pdf/renderer'

import type { TimelineEvent } from '#/lib/types'

interface TimelineChartProps {
  events: TimelineEvent[]
  maxMinutes?: number
  teamId: number
}

const GOAL_EVENT_IDS = new Set([19])
const GOAL_CONCEDED_EVENT_IDS = new Set([31])
const CARD_EVENT_IDS = new Set([5])

export function TimelineChart({
  events,
  maxMinutes = 90,
  teamId,
}: TimelineChartProps) {
  const TIMELINE_WIDTH = 700

  const processedEvents = events
    .map((event, index) => {
      const minute = event.game_minute || 0
      if (minute < 0 || minute > maxMinutes) return null

      let eventType = ''
      let label = ''
      let color = ''

      if (GOAL_EVENT_IDS.has(event.event_id)) {
        eventType = 'G'
        color = '#10b981'
        label = getInitials(event.player_name)
      } else if (GOAL_CONCEDED_EVENT_IDS.has(event.event_id)) {
        eventType = 'GC'
        color = '#ef4444'
        label = getInitials(event.player_name)
      } else if (CARD_EVENT_IDS.has(event.event_id)) {
        const subevent = event.subevent_name.toLowerCase()
        if (subevent.includes('yellow')) {
          eventType = 'Y'
          color = '#eab308'
          label = getInitials(event.player_name)
        } else if (subevent.includes('red')) {
          eventType = 'R'
          color = '#ef4444'
          label = getInitials(event.player_name)
        }
      }

      if (!eventType) return null

      const labelPosition = index % 2 === 0 ? 'above' : 'below'

      return {
        minute,
        eventType,
        label,
        color,
        isHomeTeam: event.team === teamId,
        labelPosition,
        position: (minute / maxMinutes) * TIMELINE_WIDTH,
      }
    })
    .filter((event): event is NonNullable<typeof event> => event !== null)
    .sort((a, b) => a.minute - b.minute)

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <Text style={styles.legendText}>.... [G] Goal</Text>
        <Text style={styles.legendText}>.... [Y] Yellow</Text>
        <Text style={styles.legendText}>.... [R] Red</Text>
        <Text style={styles.legendText}>.... [GC] Goal Conceded</Text>
      </View>

      <View style={styles.timelineContainer}>
        <View style={styles.timelineBase} />

        {Array.from({ length: maxMinutes / 5 + 1 }, (_, i) => {
          const minute = i * 5
          const position = (minute / maxMinutes) * TIMELINE_WIDTH
          return (
            <View
              key={`tick-${minute}`}
              style={[styles.majorTick, { left: position }]}
            />
          )
        })}

        {processedEvents.map((event, index) => (
          <View
            key={index}
            style={[
              styles.eventMarker,
              { left: event.position },
              event.labelPosition === 'above'
                ? styles.eventMarkerAbove
                : styles.eventMarkerBelow,
            ]}
          >
            <View
              style={[
                styles.eventLabelContainer,
                event.labelPosition === 'above'
                  ? styles.eventLabelAbove
                  : styles.eventLabelBelow,
              ]}
            >
              <Text style={[styles.eventLabel, { color: event.color }]}>
                [{event.eventType}] {event.label}
              </Text>
            </View>
            <View
              style={[styles.eventLine, { borderLeftColor: event.color }]}
            />
          </View>
        ))}

        {Array.from({ length: maxMinutes / 5 + 1 }, (_, i) => {
          const minute = i * 5
          const position = (minute / maxMinutes) * TIMELINE_WIDTH
          return (
            <Text
              key={`label-${minute}`}
              style={[styles.minuteLabel, { left: position }]}
            >
              {minute}
            </Text>
          )
        })}
      </View>

      <Text style={styles.axisLabel}>Minutes</Text>
    </View>
  )
}

function getInitials(name: string | undefined | null) {
  if (!name || name.trim() === '') return ''
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0][0]}. ${parts[parts.length - 1]}`
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 5,
    marginTop: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  legendText: {
    fontSize: 7,
    color: '#1e293b',
  },
  timelineContainer: {
    position: 'relative',
    width: 700,
    height: 120,
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  timelineBase: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    width: 700,
    height: 2,
    backgroundColor: '#1e293b',
  },
  majorTick: {
    position: 'absolute',
    bottom: 28,
    width: 1,
    height: 8,
    backgroundColor: '#1e293b',
  },
  eventMarker: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
    zIndex: 10,
  },
  eventMarkerAbove: {
    bottom: 30,
  },
  eventMarkerBelow: {
    bottom: 30,
  },
  eventLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 0.5,
  },
  eventLabelAbove: {
    marginBottom: 5,
  },
  eventLabelBelow: {
    marginTop: 5,
  },
  eventLabel: {
    fontSize: 6,
    fontWeight: 'bold',
  },
  eventLine: {
    width: 1,
    height: 50,
    borderLeftWidth: 1,
    borderLeftColor: '#1e293b',
    borderStyle: 'dashed',
  },
  minuteLabel: {
    position: 'absolute',
    bottom: 10,
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
    width: 20,
    marginLeft: -10,
  },
  axisLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 1,
  },
})
