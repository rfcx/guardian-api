import { IEventSQSMessage, IEventModel } from './types'
import { create, getByExternalId } from './dao'
import { ensureClassificationExists } from '../classifications/service'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const createEvent = async (eventData: IEventSQSMessage): Promise<IEventModel> => {
  // in case SQS message was received more than one time...
  const existingEvent = await getByExternalId(eventData.id)
  if (existingEvent !== null) {
    return existingEvent
  }
  const classification = await ensureClassificationExists(eventData.classification)
  return await create({
    externalId: eventData.id,
    start: eventData.start !== undefined ? dayjs.utc(eventData.start).toDate() : undefined as any,
    end: eventData.end !== undefined ? dayjs(eventData.end).toDate() : undefined as any,
    streamId: eventData.streamId,
    classification: classification._id,
    createdAt: eventData.createdAt !== undefined ? dayjs.utc(eventData.createdAt).toDate() : undefined as any
  })
}

export default { createEvent }
