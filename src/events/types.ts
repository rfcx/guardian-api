export interface EventSQSMessage {
  id: string
}

export interface EventFilters {
  ids?: string[]
  start?: Date
  end?: Date
  createdAfter?: Date
  createdBefore?: Date
  streams?: string[]
  classifications?: string[]
  incidents?: string[]
}

export interface EventCreationData {
  id: string
  start: Date
  end: Date
  streamId: string
  projectId: string
  incidentId: string
  classificationId: number
  createdAt: Date
}

export interface EventUpdatableData {
  end?: Date
  incidentId?: string
}

export interface EventsQuery {
  start: Date
  end: Date
  classifications?: string[]
  limit: number
  offset: number
  sort: string
}

export interface EventPNData {
  streamName: string
  time: string
  latitude: number
  longitude: number
  classificationName: string
  topic: string
}
