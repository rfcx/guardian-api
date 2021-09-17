import { DocumentType } from '@typegoose/typegoose'
import { EventSQSMessage, EventFilters, QueryOptionsRFCx } from '../types'
import EventModel, { Event } from './event.model'
import ClassificationModel from '../classifications/classification.model'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const createEvent = async (eventData: EventSQSMessage): Promise<DocumentType<Event>> => {
  // in case SQS message was received more than one time...
  const existingEvent = await EventModel.getByExternalId(eventData.id)
  if (existingEvent !== null) {
    return existingEvent
  }
  const classification = await ClassificationModel.ensureExists(eventData.classification)
  return await EventModel.create({
    externalId: eventData.id,
    start: eventData.start !== undefined ? dayjs.utc(eventData.start).toDate() : undefined as any,
    end: eventData.end !== undefined ? dayjs(eventData.end).toDate() : undefined as any,
    streamId: eventData.streamId,
    classification: classification._id,
    createdAt: eventData.createdAt !== undefined ? dayjs.utc(eventData.createdAt).toDate() : undefined as any
  })
}

const preprocessFilters = async (f: EventFilters = {}): Promise<EventFilters> => {
  if (f.classifications !== undefined) {
    const classifications = await ClassificationModel.list({ values: f.classifications })
    f.classifications = classifications.map(c => c._id)
  }
  return f
}

export const getEvents = async (f: EventFilters = {}, o: QueryOptionsRFCx = {}): Promise<Array<DocumentType<Event>>> => {
  f = await preprocessFilters(f)
  if (f.classifications?.length === 0) {
    return []
  }
  return await EventModel.list(f, o)
}

export const countEvents = async (f: EventFilters = {}): Promise<number> => {
  f = await preprocessFilters(f)
  if (f.classifications?.length === 0) {
    return 0
  }
  return await EventModel.total(f)
}

export default { createEvent, getEvents }
