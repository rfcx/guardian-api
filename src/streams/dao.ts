import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { StreamFilters, StreamCreationData, StreamUpdatableData, QueryOptionsRFCx } from '../types'
import { Op, Transactionable } from 'sequelize'
import Stream from './stream.model'

dayjs.extend(utc)

export const list = async function (f: StreamFilters = {}, o: QueryOptionsRFCx = {}): Promise<Stream[]> {
  const where: Stream['_attributes'] = {}
  const { ids, projects, lastEventEndAfter, lastEventEndNotNull, minLastIncidentEventsCount, hasOpenIncident } = f
  const { limit, offset, order } = o
  if (ids !== undefined) {
    where.id = { [Op.in]: ids }
  }
  if (projects !== undefined) {
    where.project_id = { [Op.in]: projects }
  }
  if (lastEventEndAfter !== undefined) {
    where.last_event_end = { [Op.gte]: dayjs.utc(lastEventEndAfter).valueOf() }
  }
  if (lastEventEndNotNull === true) {
    where.last_event_end = { [Op.ne]: null }
  }
  if (minLastIncidentEventsCount !== undefined) {
    where.last_incident_events_count = { [Op.gte]: minLastIncidentEventsCount }
  }
  if (hasOpenIncident === true) {
    where.has_open_incident = true
  }
  return await Stream.findAll({
    where,
    limit,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['last_event_end', 'DESC']]
  })
}

export const findOrCreate = async function (f: StreamCreationData, o: Transactionable = {}): Promise<[Stream, boolean]> {
  const { id, projectId, lastEventEnd } = f
  const transaction = o.transaction
  return await Stream.findOrCreate({
    where: { id },
    defaults: { projectId, lastEventEnd },
    transaction
  })
}

export const update = async function (id: string, data: StreamUpdatableData, o: Transactionable = {}): Promise<void> {
  const transaction = o.transaction
  await Stream.update(data, {
    where: {
      id: id
    },
    returning: true,
    transaction
  })
}

export default { list, findOrCreate, update }
