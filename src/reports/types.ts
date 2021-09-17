import { Schema } from 'mongoose'

enum LoggingScale {
  Small = 0,
  Medium = 1,
  Large = 2
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

export interface ReportUpdatableData {
  encounteredAt?: Date
  isLoggerEncountered?: boolean
  isEvidenceEncountered?: boolean
  evidences?: string[]
  loggingScale?: LoggingScale
  responseActions?: string[]
  attachments?: ReportAttachment[]
  note?: string
}

export interface ReportPayload extends ReportUpdatableData {
  guardianId: string
}

export interface ReportCreationData extends ReportPayload {
  user: Schema.Types.ObjectId
  schemaVersion: number
}

export interface ReportsFilters {
  start?: Date
  end?: Date
  guardians?: string[]
  users?: string[]
}
