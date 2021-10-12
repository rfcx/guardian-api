import { StreamResponse } from '../types'

export interface StreamQuery {
  projects: string[]
  only_public: boolean
  keyword: string
  limit: number
  offset: number
  sort: string
  fields: string[]
  with_events_count: boolean
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
