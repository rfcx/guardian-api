import { StreamResponse } from '../types'

export interface StreamQuery {
  projects: string[]
  keyword: string
  limit: number
  offset: number
  sort: string
  fields: string[]
  with_events_count: boolean
  active: boolean
}

export interface StreamFilters {
  ids?: string[]
  lastEventEndNotNull?: boolean
}

export interface StreamResponseWithEventsCount extends StreamResponse {
  eventsCount: number
}

export interface Stream {
  id: string
  name: string
  latitude: number
  longitude: number
}
