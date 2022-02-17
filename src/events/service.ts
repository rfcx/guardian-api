import { Transaction, Transactionable } from 'sequelize'
import { EventSQSMessage, ProjectResponse, EventResponse, StreamResponse, PNData, StreamUpdatableData } from '../types'
import { sequelize } from '../common/db'
import Event from './event.model'
import { get, create, list, count, update } from './dao'
import { ensureClassificationExists } from '../classifications/service'
import { getLastResponseForStream } from '../responses/service'
import { getEvent, getStream } from '../common/core-api/index'
import { refreshOpenIncidentsCount } from '../streams/service'
import { getProjectIncidentRange } from '../projects/service'
import incidentsDao from '../incidents/dao'
import streamsDao from '../streams/dao'
import { findOrCreateIncidentForEvent } from '../incidents/service'
import { sendToTopic } from '../common/firebase'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)

export const getEventsSinceLastReport = async (streamId: string): Promise<Event[]> => {
  const lastReport = await getLastResponseForStream(streamId)
  const projectIncidentRange = await getProjectIncidentRange(lastReport?.projectId)
  const projectIncidentRangeStart = dayjs().subtract(projectIncidentRange, 'days')
  const date = lastReport !== null ? dayjs.max(projectIncidentRangeStart, dayjs(lastReport.investigatedAt)) : projectIncidentRangeStart
  return await list({
    streams: [streamId],
    start: date.toDate()
  }, {
    limit: 1000000000 // just a big value to overwrite default 100
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
    const existingEvent = await get(eventData.id, { transaction })
    if (existingEvent !== null) {
      return null
    }
    const coreEvent = await getEvent(eventData.id).then(e => e.data)
    const coreStream = await getStream(coreEvent.streamId).then(e => e.data)
    if (coreStream.project === null) {
      throw new Error('Stream must be associated with a project')
    }
    const projectId = (coreStream.project as any).id
    const start = dayjs.utc(coreEvent.start).toDate()
    const end = dayjs.utc(coreEvent.end).toDate()
    const [stream, created] = await streamsDao.findOrCreate({ id: coreStream.id, projectId, lastEventEnd: end }, { transaction })
    const streamUpdate: StreamUpdatableData = {}
    if (!created) {
      streamUpdate.lastEventEnd = end.toISOString()
      if (stream.projectId !== projectId) {
        streamUpdate.projectId = projectId
      }
    }
    const classification = await ensureClassificationExists(coreEvent.classification, { transaction })
    const incidentForEvent = await findOrCreateIncidentForEvent(coreStream, { transaction })
    const event = await create({
      id: eventData.id,
      start,
      end,
      streamId: coreStream.id,
      projectId,
      classificationId: classification.id,
      createdAt: coreEvent.createdAt !== undefined ? dayjs.utc(coreEvent.createdAt).toDate() : undefined as any,
      incidentId: incidentForEvent.id
    }, { transaction })
    if (incidentForEvent.firstEvent === undefined) {
      await incidentsDao.update(incidentForEvent.id, { firstEventId: event.id }, { transaction })
    }
    const lastIncidentEventsCount = await countEventsForIncident(incidentForEvent.id, { transaction })
    await streamsDao.update(coreStream.id, { ...streamUpdate, lastIncidentEventsCount }, { transaction })
    await refreshOpenIncidentsCount(coreStream.id, { transaction })
    return { event, coreEvent: coreEvent, coreStream: coreStream }
  })
}

export const updateEvent = async (eventData: EventSQSMessage): Promise<string> => {
  const id = eventData.id
  const existingEvent = await get(id)
  if (existingEvent !== null) {
    const coreEvent = await getEvent(eventData.id).then(e => e.data)
    await update(coreEvent.id, { end: dayjs.utc(coreEvent.end).toDate() })
  } else {
    await createEvent({ id })
  }
  return id
}

export const sendPushNotification = async (event: EventResponse, stream: StreamResponse): Promise<string> => {
  const localTime = dayjs.tz(event.start, stream.timezone).format('HH:mm YYYY-MM-DD')
  const body = `A ${event.classification.title} detected on "${stream.name}" at ${localTime}`
  const opts: PNData = {
    topic: `project_${(stream.project as ProjectResponse).id}`,
    data: {
      streamId: stream.id,
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

export const countEventsForIncident = async (incidentId: string, o: Transactionable = {}): Promise<number> => {
  return await count({ incidents: [incidentId] }, o)
}

export default { createEvent, sendPushNotification }
