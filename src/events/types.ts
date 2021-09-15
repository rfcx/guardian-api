import { Document } from 'mongoose'
import { IClassificationModel, IClassification } from '../types'

export interface IEvent {
  externalId: string
  start: Date
  end: Date
  streamId: string
  classification: IClassificationModel['_id']
  createdAt: Date
}

export interface IEventSQSMessage {
  id: string
  start: string
  end: string
  streamId: string
  classification: IClassification
  createdAt: string
}

export interface IEventModel extends Document, IEvent {}
