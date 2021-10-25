import { Transaction } from 'sequelize'
import { EventSQSMessage, Project, EventResponse, StreamResponse, StreamResponseWithEventsCount, PNData } from '../types'
import { sequelize } from '../common/db'
import Event from './event.model'
import { get, create, list, count } from './dao'
import { ensureClassificationExists } from '../classifications/service'
import { getLastResponseForStream } from '../responses/service'
import { getEvent, getStream } from '../common/core-api/index'
import incidentsDao from '../incidents/dao'
import { findOrCreateIncidentForEvent } from '../incidents/service'
import { sendToTopic } from '../common/firebase'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const getEventsCountSinceLastReport = async (streams: StreamResponse[]): Promise<void> => {
  for (const stream of streams as StreamResponseWithEventsCount[]) {
    const lastReport = await getLastResponseForStream(stream.id)
    stream.eventsCount = await count({
      streams: [stream.id],
      ...lastReport !== null ? { createdAfter: lastReport.createdAt } : {}
    })
  }
}

export const getEventsSinceLastReport = async (streamId: string): Promise<Event[]> => {
  const lastReport = await getLastResponseForStream(streamId)
  return await list({
    streams: [streamId],
    ...lastReport !== null ? { createdAfter: lastReport.createdAt } : {}
  })
}

/*
  1. If there is no open incident for the site then create new incident
  2. If there is an open incident (for the site) and it’s first event is more than 7 days previous then create new incident
  3. If there is an open incident with at least 1 report then create new incident
  4. Else add event to existing incident
*/
export const createEvent = async (eventData: EventSQSMessage): Promise<{ event: Event, coreEvent: EventResponse, coreStream: StreamResponse } | null> => {
  // in case SQS message was received more than one time...
  return await sequelize.transaction(async (transaction: Transaction) => {
    const existingEvent = await get(eventData.id)
    if (existingEvent !== null) {
      return null
    }
    const coreEvent = await getEvent(eventData.id).then(e => e.data)
    const coreStream = await getStream(coreEvent.streamId).then(e => e.data)
    if (coreStream.project === null) {
      throw new Error('Stream must be associated with a project')
    }
    const classification = await ensureClassificationExists(coreEvent.classification)
    const incidentForEvent = await findOrCreateIncidentForEvent(coreStream, { transaction })
    const event = await create({
      id: eventData.id,
      start: coreEvent.start !== undefined ? dayjs.utc(coreEvent.start).toDate() : undefined as any,
      end: coreEvent.end !== undefined ? dayjs(coreEvent.end).toDate() : undefined as any,
      streamId: coreStream.id,
      projectId: (coreStream.project as any).id,
      classificationId: classification.id,
      createdAt: coreEvent.createdAt !== undefined ? dayjs.utc(coreEvent.createdAt).toDate() : undefined as any,
      incidentId: incidentForEvent.id
    }, { transaction })
    if (incidentForEvent.firstEvent === undefined) {
      await incidentsDao.update(incidentForEvent.id, { firstEventId: event.id }, { transaction })
    }
    return { event, coreEvent: coreEvent, coreStream: coreStream }
  })
}

export const sendPushNotification = async (event: EventResponse, stream: StreamResponse): Promise<string> => {
  const localTime = dayjs.tz(event.start, stream.timezone).format('HH:mm YYYY-MM-DD')
  const body = `A ${event.classification.title} detected on "${stream.name}" at ${localTime}`
  const opts: PNData = {
    topic: `project_${(stream.project as Project).id}`,
    data: {
      streamName: stream.name,
      time: localTime,
      latitude: stream.latitude.toString(),
      longitude: stream.longitude.toString(),
      classificationName: event.classification.title
    },
    title: 'Rainforest Connection',
    body
  }
  return await sendToTopic(opts)
}

export default { createEvent, sendPushNotification }
