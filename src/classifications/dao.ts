import { IClassification, IClassificationModel, IClassificationFilters, IQueryOptions } from '../types'
import { FilterQuery, QueryOptions } from 'mongoose'
import Classification from './classification.model'

export async function getByValue (value: IClassification['value']): Promise<IClassificationModel | null> {
  return await Classification.findOne({ value })
}

export async function list (f: IClassificationFilters = {}, o: IQueryOptions = {}): Promise<IClassificationModel[]> {
  const filters: FilterQuery<IClassificationModel> = {}
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

export async function create (data: IClassification): Promise<IClassificationModel> {
  return await Classification.create(data)
}

export default { getByValue, list, create }
