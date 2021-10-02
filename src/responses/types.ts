enum LoggingScale {
  NotSure = 0,
  Small = 1,
  Large = 2
}

enum DamageScale {
  No = 0,
  Small = 1,
  Medium = 2,
  Large = 3
}

enum AttachmentType {
  photo = 0,
  audio = 1,
  video = 2
}

interface ReportAttachment {
  type: AttachmentType
  src: string
  note: string
}

export interface ResponseUpdatableData {
  investigatedAt?: Date
  evidences?: number[]
  attachments?: ReportAttachment[]
  loggingScale?: LoggingScale
  damageScale?: DamageScale
  responseActions?: number[]
  note?: string
}

export interface ResponsePayload extends ResponseUpdatableData {
  streamId: string
  projectId: string
}

export interface ResponseCreationData extends ResponsePayload {
  createdById: number
  schemaVersion: number
  incidentId: string
}

export interface ResponseFilters {
  investigatedAfter?: Date
  investigatedBefore?: Date
  startedAfter?: Date
  startedBefore?: Date
  submittedAfter?: Date
  submittedBefore?: Date
  createdAfter?: Date
  createdBefore?: Date
  streams?: string[]
  users?: string[]
}
