import Event from './event.model'
import { CreateOptions, Transactionable } from 'sequelize'
import { EventFilters, QueryOptionsRFCx, EventCreationData, EventUpdatableData } from '../types'
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

export const get = async function (id: string, o: Transactionable = {}): Promise<Event | null> {
  const transaction = o.transaction
  return await Event.findByPk(id, {
    attributes: {
      exclude: ['updatedAt']
    },
    include,
    transaction
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

export const update = async function (id: string, data: EventUpdatableData, o: Transactionable = {}): Promise<void> {
  const transaction = o.transaction
  await Event.update(data, { where: { id }, transaction })
}

export const updateBatch = async function (f: EventFilters = {}, data: EventUpdatableData = {}, o: Transactionable = {}): Promise<[number, Event[]]> {
  const transaction = o.transaction
  const where = combineWhere(f)
  const { end, incidentId } = data
  return await Event.update({ end, incidentId }, { where, transaction })
}

export const count = async function (f: EventFilters = {}, o: Transactionable = {}): Promise<number> {
  const where = combineWhere(f)
  const transaction = o.transaction
  return await Event.count({ where, transaction })
}

export default { create, get, list, update, updateBatch, count }
