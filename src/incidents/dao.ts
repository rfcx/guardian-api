import Incident, { incidentAttributes } from './incident.model'
import { IncidentFilters, QueryOptionsRFCx, IncidentCreationData, IncidentUpdatableData } from '../types'
import { combineOptions } from './helpers'
import { CreateOptions, Transactionable } from 'sequelize'
import { availableIncludes } from './misc'

export const create = async function (data: IncidentCreationData, o: CreateOptions = {}): Promise<Incident> {
  const transaction = o.transaction
  return await Incident.create(data, { transaction })
}

export const get = async function (id: string, fields: string[] = [], o: Transactionable = {}): Promise<Incident | null> {
  const hasFields = fields !== undefined && fields.length > 0
  const transaction = o.transaction
  const attributes = hasFields ? incidentAttributes.full.filter(a => fields.includes(a)) : incidentAttributes.full
  const include = hasFields ? availableIncludes.filter(i => fields.includes(i.as)) : availableIncludes
  return await Incident.findByPk(id, {
    attributes,
    include,
    transaction
  })
}

export const list = async function (f: IncidentFilters = {}, o: QueryOptionsRFCx = {}): Promise<Incident[]> {
  const options = await combineOptions(f, o)
  return await Incident.findAll(options)
}

export const count = async function (f: IncidentFilters = {}, o: Transactionable = {}): Promise<number> {
  const { where, include } = await combineOptions(f)
  const transaction = o.transaction
  return await Incident.count({ where, include, transaction })
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

export default { create, get, list, count, update }
