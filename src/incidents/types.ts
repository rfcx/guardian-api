export interface IncidentFilters {
  streams?: string[]
  projects?: string[]
  isClosed?: boolean
  noResponses?: boolean
  closedAfter?: Date
  closedBefore?: Date
  firstEventAfter?: Date
  firstEventBefore?: Date
  firstResponseAfter?: Date
  firstResponseBefore?: Date
}

export interface IncidentUpdatableData {
  closedAt?: Date
  firstEventId?: string
  firstResponseId?: string
}

export interface IncidentCreationData extends IncidentUpdatableData {
  streamId: string
  projectId: string
  classificationId?: number
}

export interface IncidentQuery {
  streams?: string[]
  projects?: string[]
  closed?: boolean
  limit: number
  offset: number
  sort: string
}

export interface IncidentFormatted {
  id: string
  ref: number
  streamId: string
  projectId: string
  createdAt: string
  closedAt: string
}
