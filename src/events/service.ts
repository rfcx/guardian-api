import { Transaction } from 'sequelize'
import { EventSQSMessage } from '../types'
import { sequelize } from '../common/db'
import Event from './event.model'
import { get, create } from './dao'
import { ensureClassificationExists } from '../classifications/service'
import incidentsDao from '../incidents/dao'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

/*
  1. If there is no open incident for the site then create new incident
  2. If there is an open incident (for the site) and it’s first event is more than 7 days previous then create new incident
  3. If there is an open incident with at least 1 report then create new incident
  4. Else add event to existing incident
*/
export const createEvent = async (eventData: EventSQSMessage): Promise<Event> => {
  // in case SQS message was received more than one time...
  const existingEvent = await get(eventData.id)
  if (existingEvent !== null) {
    return existingEvent
  }
  const classification = await ensureClassificationExists(eventData.classification)
  let incidentForEvent
  const existingIncidents = await incidentsDao.list({
    streams: [eventData.streamId],
    closedAtIsNull: true
  }, { order: { field: 'createdAt', dir: 'DESC' } })
  const activeIncidents = existingIncidents.filter((incident) => {
    return incident.firstEvent !== null && dayjs().diff(incident.firstEvent.createdAt, 'd', true) < 7
  })
  return await sequelize.transaction(async (transaction: Transaction) => {
    if (activeIncidents.length === 0) {
      incidentForEvent = await incidentsDao.create({
        streamId: eventData.streamId,
        projectId: eventData.projectId,
        classificationId: classification.id
      }, { transaction })
    } else {
      incidentForEvent = activeIncidents[0]
    }
    const event = await create({
      id: eventData.id,
      start: eventData.start !== undefined ? dayjs.utc(eventData.start).toDate() : undefined as any,
      end: eventData.end !== undefined ? dayjs(eventData.end).toDate() : undefined as any,
      streamId: eventData.streamId,
      projectId: eventData.projectId,
      classificationId: classification.id,
      createdAt: eventData.createdAt !== undefined ? dayjs.utc(eventData.createdAt).toDate() : undefined as any,
      incidentId: incidentForEvent.id
    }, { transaction })
    if (incidentForEvent.firstEvent === undefined) {
      await incidentsDao.update(incidentForEvent.id, { firstEventId: event.id }, { transaction })
    }
    return event
  })
}

export default { createEvent }
