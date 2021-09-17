import { Classification } from '../classifications/classification.model'

export interface EventSQSMessage {
  id: string
  start: string
  end: string
  streamId: string
  classification: Classification
  createdAt: string
}

export interface EventFilters {
  start?: Date
  end?: Date
  createdAfter?: Date
  createdBefore?: Date
  streams?: string[]
  classifications?: string[]
}
