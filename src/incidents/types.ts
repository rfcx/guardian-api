export interface IncidentFilters {
  streams?: string[]
  projects?: string[]
  classifications?: string[]
  closedAtIsNull?: boolean
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
