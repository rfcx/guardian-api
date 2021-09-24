import Event from './event.model'
import { EventFilters, QueryOptionsRFCx, EventCreationData } from '../types'
import { combineWhere } from './helpers'

export const create = async function (data: EventCreationData): Promise<Event> {
  return await Event.create(data)
}

export const get = async function (id: string): Promise<Event | null> {
  return await Event.findByPk(id, {
    attributes: {
      exclude: ['updatedAt']
    }
  })
}

export const list = async function (f: EventFilters = {}, o: QueryOptionsRFCx = {}): Promise<Event[]> {
  const where = combineWhere(f)
  const { limit, offset, order } = o
  return await Event.findAll({
    where,
    limit: limit ?? 100,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['start', 'DESC']]
  })
}

export const count = async function (f: EventFilters = {}): Promise<number> {
  const where = combineWhere(f)
  return await Event.count({ where })
}

export default { get, list, count }
