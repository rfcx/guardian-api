import Incident, { incidentAttributes } from './incident.model'
import { list, get, update, count, getNextRefForProject } from './dao'
import { StreamResponse, ResponsePayload, IncidentQuery, ListResults, IncidentPatchPayload, IncidentUpdatableData } from '../types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Transactionable } from 'sequelize'
import { querySortToOrder } from '../common/db/helpers'
import User from '../users/user.model'
import { EmptyResultError } from '@rfcx/http-utils'
import { ensureUserExists } from '../users/service'

dayjs.extend(utc)

export const getIncidents = async (params: IncidentQuery): Promise<ListResults<Incident>> => {
  const { streams, projects, closed, limit, offset, sort } = params
  const total = await count({
    streams,
    projects,
    isClosed: closed
  })
  const results = await list({
    streams,
    projects,
    isClosed: closed
  }, {
    limit,
    offset,
    order: querySortToOrder(sort),
    fields: [...incidentAttributes.full, 'closedBy', 'events', 'responses']
  })
  return { total, results }
}

export const getIncident = async (id: string): Promise<Incident | null> => {
  return await get(id, [...incidentAttributes.full, 'closedBy', 'events', 'responses'])
}

export const updateIncident = async (id: string, payload: IncidentPatchPayload, userData: User): Promise<void> => {
  const incident = await get(id)
  const user = await ensureUserExists(userData)
  if (incident === null) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new EmptyResultError('Incident with given id not found')
  }
  const { closed } = payload
  const data: IncidentUpdatableData = {}
  if (closed !== undefined) {
    data.closedAt = closed ? dayjs.utc().toDate() : null
    data.closedById = closed ? user.id : null
  }
  await update(id, data)
}

export const findOrCreateIncidentForEvent = async (streamData: StreamResponse, o: Transactionable = {}): Promise<Incident> => {
  const existingIncidents = await list({
    streams: [streamData.id],
    isClosed: false
  }, {
    order: {
      field: 'createdAt',
      dir: 'DESC'
    },
    fields: ['id', 'firstEvent']
  })
  const activeIncidents = existingIncidents.filter((incident) => {
    return incident.firstEvent !== null && dayjs().diff(incident.firstEvent.createdAt, 'd', true) < 7
  })
  if (activeIncidents.length !== 0) {
    return activeIncidents[0]
  } else {
    const transaction = o.transaction
    const ref = await getNextRefForProject((streamData.project as any).id, { transaction })
    return await Incident.create({
      streamId: streamData.id,
      projectId: (streamData.project as any).id,
      ref
    }, { transaction })
  }
}

/*
  1. IF there is an incident (open or closed) with no responses AND the first event was less than 7 days before the investigation date of the new response THEN add the response to the incident
  2. IF there is an incident (open or closed) with a first response investigation date within 24 hours of the new response THEN add the new response to the incident
  3. ELSE create a new incident with the response
*/
export const findOrCreateIncidentForResponse = async (responseData: ResponsePayload, o: Transactionable = {}): Promise<Incident> => {
  let incidents = await list({
    streams: [responseData.streamId],
    noResponses: true
  }, {
    order: {
      field: 'createdAt',
      dir: 'DESC'
    },
    fields: ['id', 'firstEvent', 'firstResponse']
  })
  let lastIncident: Incident | undefined | null
  lastIncident = incidents.find((incident) => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return incident.firstEvent !== null && dayjs(responseData.investigatedAt).diff(incident.firstEvent.createdAt, 'd', true) < 7
  })
  if (lastIncident !== null && lastIncident !== undefined) {
    return lastIncident
  }

  incidents = await list({
    streams: [responseData.streamId]
  }, {
    order: {
      field: 'createdAt',
      dir: 'DESC'
    },
    fields: ['id', 'firstEvent', 'firstResponse']
  })
  lastIncident = incidents.find((incident) => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return incident.firstResponse !== null && dayjs(responseData.investigatedAt).diff(incident.firstResponse.investigatedAt, 'h', true) < 24
  })
  if (lastIncident !== null && lastIncident !== undefined) {
    return lastIncident
  }

  const transaction = o.transaction
  const ref = await getNextRefForProject(responseData.projectId, { transaction })
  const incident = await Incident.create({
    streamId: responseData.streamId,
    projectId: responseData.projectId,
    ref
  }, { transaction })
  return await get(incident.id) as Incident
}
