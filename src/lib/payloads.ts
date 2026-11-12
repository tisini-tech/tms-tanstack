export interface ApiResponse {
  message: string
  error: string
}

export interface CreateMatchEventPayload {
  metric_id: number
  metric_detail_id: number
  metric_sub_detail_id: number
  player_id: number
  subplayer_id: number
  team_id: number
  minute: number
  second: number
  moment: string
  quarter: string
  narration: string
  zone_id: number
  xper: string
  yper: string
  video_timestamp: number
  no_ruck: string
  no_lineout: string
  meter_gain: string
  kickfrom: string
  kickland: string
  defender: string
  localid: string
  app_timelog: string
  sync_status: number
}
