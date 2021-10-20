export interface EventSQSMessage {
  id: string
}

export interface EventFilters {
  start?: Date
  end?: Date
  createdAfter?: Date
  createdBefore?: Date
  streams?: string[]
  classifications?: string[]
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

export interface EventsQuery {
  start: Date
  end: Date
  classifications?: string[]
  limit: number
  offset: number
  sort: string
}
