import { UserFormatted, IncidentFormatted } from '../types'
import Answer from './models/answer.model'

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
  attachments?: ReportAttachment[]
  answers?: number[]
  note?: string
  isUnexpected: Boolean
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

export interface ResponseFormatted {
  id: string
  streamId: string
  projectId: string
  investigatedAt: string
  startedAt: string
  submittedAt: string
  isUnexpected: boolean
  createdAt: string
  createdBy: UserFormatted
  answers: GroupedAnswers[]
  incident: IncidentFormatted
}

export interface QuestionFormatted {
  id: string
  text: string
}

export interface GroupedAnswers {
  question: QuestionFormatted
  answers: Answer[]
}
