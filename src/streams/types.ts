import { StreamResponse } from '../types'
import Incident from '../incidents/incident.model'

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
export interface StreamWithIncidentsQuery {
  projects: string[]
  keyword: string
  hasNewEvents: boolean
  hasHotIncident: boolean
  includeClosedIncidents: boolean
  limit: number
  offset: number
  limitIncidents: number
  fields: string[]
}

export interface StreamFilters {
  ids?: string[]
  projects?: string[]
  lastEventEndNotNull?: boolean
  lastEventEndAfter?: Date
  minLastIncidentEventsCount?: number
  hasOpenIncident?: boolean
}

export interface StreamCreationData {
  id: string
  projectId: string
  lastEventEnd: Date
}

export interface StreamUpdatableData {
  projectId?: string
  lastEventEnd?: string
  lastIncidentEventsCount?: number
  hasOpenIncident?: boolean
  guardianType?: string
}

export interface StreamResponseWithIncidents extends StreamResponse {
  incidents: {
    total: number
    items: Incident[]
  }
  guardianType?: string
}

export interface StreamResponseWithTags extends StreamResponse {
  tags: string[]
  guardianType?: string | null
}

export interface Stream {
  id: string
  name: string
  latitude: number
  longitude: number
}

export interface Guardian {
  type: string
}
