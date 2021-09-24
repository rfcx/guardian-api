import { Op } from 'sequelize'
import Classification from './classification.model'
import { ClassificationFilters, QueryOptionsRFCx } from '../types'

export const getByValue = async function (value: string): Promise<Classification | null> {
  return await Classification.findOne({ where: { value } })
}

export const create = async function (classification: Classification): Promise<Classification> {
  return await Classification.create(classification)
}

export const list = async function (f: ClassificationFilters = {}, o: QueryOptionsRFCx = {}): Promise<Classification[]> {
  const where: Classification['_attributes'] = {}
  const { values } = f
  const { limit, offset, order } = o
  if (values !== undefined) {
    where.guardianId = { [Op.in]: values }
  }
  return await Classification.findAll({
    where,
    limit: limit ?? 100,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['value', 'ASC']]
  })
}

export default { getByValue, create, list }
