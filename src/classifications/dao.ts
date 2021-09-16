import { ClassificationDao, ClassificationModel, ClassificationFilters, QueryOptionsRFCx } from '../types'
import { FilterQuery, QueryOptions } from 'mongoose'
import Classification from './classification.model'

export async function getByValue (value: ClassificationDao['value']): Promise<ClassificationModel | null> {
  return await Classification.findOne({ value })
}

export async function list (f: ClassificationFilters = {}, o: QueryOptionsRFCx = {}): Promise<ClassificationModel[]> {
  const filters: FilterQuery<ClassificationModel> = {}
  const options: QueryOptions = {}
  const { values } = f
  const { limit, offset, sort } = o
  if (values !== undefined) {
    filters.value = { $in: values }
  }
  if (limit !== undefined) {
    options.limit = limit
  }
  if (offset !== undefined) {
    options.skip = offset
  }
  if (sort !== undefined) {
    options.sort = { [sort.field]: sort.order }
  }

  return await Classification.find(filters, null, options)
}

export async function create (data: ClassificationDao): Promise<ClassificationModel> {
  return await Classification.create(data)
}

export default { getByValue, list, create }
