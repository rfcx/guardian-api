import Event from './event.model'
import { CreateOptions } from 'sequelize'
import { EventFilters, QueryOptionsRFCx, EventCreationData } from '../types'
import { combineWhere } from './helpers'
import Classification from '../classifications/classification.model'
import Incident from '../incidents/incident.model'

const include = [
  { model: Classification, attributes: ['value', 'title'] },
  { model: Incident, attributes: ['id', 'closedAt', 'createdAt'] }
]

export const create = async function (data: EventCreationData, o: CreateOptions = {}): Promise<Event> {
  const transaction = o.transaction
  return await Event.create(data, { transaction })
}

export const get = async function (id: string): Promise<Event | null> {
  return await Event.findByPk(id, {
    attributes: {
      exclude: ['updatedAt']
    },
    include
  })
}

export const list = async function (f: EventFilters = {}, o: QueryOptionsRFCx = {}): Promise<Event[]> {
  const where = combineWhere(f)
  const { limit, offset, order } = o
  return await Event.findAll({
    where,
    limit: limit ?? 100,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['start', 'DESC']],
    attributes: {
      exclude: ['classificationId', 'incidentId']
    },
    include
  })
}

export const count = async function (f: EventFilters = {}): Promise<number> {
  const where = combineWhere(f)
  return await Event.count({ where })
}

export default { get, list, count }
