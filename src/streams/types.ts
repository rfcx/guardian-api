import { IProject, IStreamResponse } from '../types'

export interface IStreamQuery {
  projects: string[]
  only_public: boolean
  keyword: string
  limit: number
  offset: number
  sort: string
  fields: string[]
  with_events_count: boolean
}

export interface IStream {
  id: string
  name: string
  latitude: number
  longitude: number
  project: IProject
}

export interface IStreamResponseWithEventsCount extends IStreamResponse {
  eventsCount: number
}
