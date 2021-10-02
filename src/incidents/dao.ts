import Incident from './incident.model'
import { IncidentFilters, QueryOptionsRFCx, IncidentCreationData, IncidentUpdatableData } from '../types'
import { combineWhere } from './helpers'
import { CreateOptions, Transactionable } from 'sequelize'

export const create = async function (data: IncidentCreationData, o: CreateOptions = {}): Promise<Incident> {
  const transaction = o.transaction
  return await Incident.create(data, { transaction })
}

export const get = async function (id: string): Promise<Incident | null> {
  return await Incident.findByPk(id, {
    attributes: {
      exclude: ['updatedAt']
    },
    include: [{ all: true }]
  })
}

export const list = async function (f: IncidentFilters = {}, o: QueryOptionsRFCx = {}): Promise<Incident[]> {
  const where = combineWhere(f)
  const { limit, offset, order } = o
  return await Incident.findAll({
    where,
    limit: limit ?? 100,
    offset: offset ?? 0,
    include: [{ all: true }],
    order: order !== undefined ? [[order.field, order.dir]] : [['createdAt', 'DESC']]
  })
}

export const update = async function (id: string, data: IncidentUpdatableData, o: Transactionable = {}): Promise<void> {
  const transaction = o.transaction
  await Incident.update(data, { where: { id }, transaction })
}

export default { create, get, list, update }
