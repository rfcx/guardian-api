import { Document } from 'mongoose'
import { ClassificationModel, ClassificationDao } from '../types'

export interface EventDao {
  externalId: string
  start: Date
  end: Date
  streamId: string
  classification: ClassificationModel['_id']
  createdAt: Date
}

export interface EventSQSMessage {
  id: string
  start: string
  end: string
  streamId: string
  classification: ClassificationDao
  createdAt: string
}

export interface EventModel extends Document, EventDao {}

export interface EventFilters {
  start?: Date
  end?: Date
  createdAfter?: Date
  createdBefore?: Date
  streams?: string[]
  classifications?: string[]
}
