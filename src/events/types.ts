import Classification from '../classifications/classification.model'

export interface EventSQSMessage {
  id: string
  start: string
  end: string
  streamId: string
  classification: Classification['_attributes']
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

export interface EventCreationData {
  id: string
  start: Date
  end: Date
  streamId: string
  classificationId: number
  createdAt: Date
}
