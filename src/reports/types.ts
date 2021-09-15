import { Document } from 'mongoose'
import { IUserModel } from '../users/types'

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

export interface IReportUpdatableData {
  encounteredAt?: Date
  isLoggerEncountered?: boolean
  isEvidenceEncountered?: boolean
  evidences?: string[]
  loggingScale?: LoggingScale
  responseActions?: string[]
  attachments?: ReportAttachment[]
  note?: string
}

export interface IReportPayload extends IReportUpdatableData {
  guardianId: string
}

export interface IReportCreationData extends IReportPayload {
  user: IUserModel['_id']
  schemaVersion: number
}

export interface IReport extends IReportPayload {
  createdAt: Date
  updatedAt: Date
  user: IUserModel['_id']
  schemaVersion: number
}

export interface IReportModel extends Document, IReport {}

export interface IReportsFilters {
  start?: Date
  end?: Date
  guardians?: string[]
  users?: string[]
}
