export interface IncidentFilters {
  streams?: string[]
  projects?: string[]
  isClosed?: boolean
  minEvents?: number
  noResponses?: boolean
  closedAfter?: Date
  closedBefore?: Date
  firstEventAfter?: Date
  firstEventBefore?: Date
  firstResponseAfter?: Date
  firstResponseBefore?: Date
}

export interface IncidentPatchPayload {
  closed?: boolean
}

export interface IncidentUpdatableData {
  closedAt?: Date | null
  closedById?: number | null
  firstEventId?: string
  firstResponseId?: string
}

export interface IncidentCreationData extends IncidentUpdatableData {
  streamId: string
  projectId: string
  classificationId?: number
  ref?: number
}

export interface IncidentQuery {
  streams?: string[]
  projects?: string[]
  closed?: boolean
  minEvents?: number
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
