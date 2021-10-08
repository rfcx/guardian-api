import Incident, { incidentAttributes } from './incident.model'
import { IncidentFilters, QueryOptionsRFCx, IncidentCreationData, IncidentUpdatableData } from '../types'
import { combineWhere } from './helpers'
import { CreateOptions, Transactionable } from 'sequelize'
import { availableIncludes } from './misc'

export const create = async function (data: IncidentCreationData, o: CreateOptions = {}): Promise<Incident> {
  const transaction = o.transaction
  return await Incident.create(data, { transaction })
}

export const get = async function (id: string, fields: string[] = []): Promise<Incident | null> {
  const hasFields = fields !== undefined && fields.length > 0
  const attributes = hasFields ? incidentAttributes.full.filter(a => fields.includes(a)) : incidentAttributes.full
  const include = hasFields ? availableIncludes.filter(i => fields.includes(i.as)) : availableIncludes
  return await Incident.findByPk(id, {
    attributes,
    include
  })
}

export const list = async function (f: IncidentFilters = {}, o: QueryOptionsRFCx = {}): Promise<Incident[]> {
  const where = combineWhere(f)
  const { limit, offset, order, fields } = o

  const hasFields = fields !== undefined && fields.length > 0
  const attributes = hasFields ? incidentAttributes.full.filter(a => fields.includes(a)) : incidentAttributes.lite
  const include = hasFields ? availableIncludes.filter(i => fields.includes(i.as)) : []

  return await Incident.findAll({
    where,
    limit: limit ?? 100,
    offset: offset ?? 0,
    include,
    attributes,
    order: order !== undefined ? [[order.field, order.dir]] : [['createdAt', 'DESC']]
  })
}

export const count = async function (f: IncidentFilters = {}): Promise<number> {
  const where = combineWhere(f)
  return await Incident.count({ where })
}

export const update = async function (id: string, data: IncidentUpdatableData, o: Transactionable = {}): Promise<void> {
  const transaction = o.transaction
  await Incident.update(data, { where: { id }, transaction })
}

export const getNextRefForProject = async function (projectId: string, o: Transactionable = {}): Promise<number> {
  const transaction = o.transaction
  const maxRef: number = await Incident.max('ref', {
    where: { projectId },
    transaction
  })
  return isNaN(maxRef) ? 1 : maxRef + 1
}

export default { create, get, list, update }
