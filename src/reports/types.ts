import { Schema } from 'mongoose'

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

export interface ReportUpdatableData {
  encounteredAt?: Date
  evidences?: string[]
  loggingScale?: LoggingScale
  damageScale?: DamageScale
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
