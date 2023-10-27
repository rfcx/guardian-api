import { Op, Transactionable } from 'sequelize'
import Classification from './classification.model'
import { ClassificationFilters, QueryOptionsRFCx } from '../types'

export const getByValue = async function (value: string, o: Transactionable = {}): Promise<Classification | null> {
  const transaction = o.transaction
  return await Classification.findOne({ where: { value }, transaction })
}

export const create = async function (classification: Classification, o: Transactionable = {}): Promise<Classification> {
  const transaction = o.transaction
  return await Classification.create(classification as any, { transaction })
}

export const list = async function (f: ClassificationFilters = {}, o: QueryOptionsRFCx = {}): Promise<Classification[]> {
  const where: Classification['_attributes'] = {}
  const { values } = f
  const { limit, offset, order } = o
  if (values !== undefined) {
    where.value = { [Op.in]: values }
  }
  return await Classification.findAll({
    where,
    limit: limit ?? 100,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['value', 'ASC']]
  })
}

export default { getByValue, create, list }
