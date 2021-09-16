import { ProjectDao, StreamResponse } from '../types'

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

export interface StreamDao {
  id: string
  name: string
  latitude: number
  longitude: number
  project: ProjectDao
}

export interface StreamResponseWithEventsCount extends StreamResponse {
  eventsCount: number
}
