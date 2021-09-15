import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { DeleteResult } from 'mongodb'
import { IEvent, IEventModel, IEventFilters, IQueryOptions } from '../types'
import { FilterQuery, QueryOptions } from 'mongoose'
import Event from './event.model'

dayjs.extend(utc)

function combineFilters (f: IEventFilters = {}): FilterQuery<IEventModel> {
  const filters: FilterQuery<IEventModel> = {}
  const { start, end, createdAfter, createdBefore, streams, classifications } = f
  if (start !== undefined || end !== undefined) {
    const startCond: object = { $gte: dayjs.utc(start).valueOf() } ?? undefined
    const endCond: object = { $lt: dayjs.utc(start).valueOf() } ?? undefined
    if (start !== undefined && end !== undefined) {
      filters.start = { $and: { ...startCond, ...endCond } } as any
    } else if (start !== undefined) {
      filters.start = startCond
    } else if (end !== undefined) {
      filters.start = endCond
    }
  }
  if (createdAfter !== undefined || createdBefore !== undefined) {
    const createdAfterCond: object = { $gte: dayjs.utc(createdAfter).valueOf() } ?? undefined
    const createdBeforeCond: object = { $lt: dayjs.utc(createdBefore).valueOf() } ?? undefined
    if (createdAfter !== undefined && createdBefore !== undefined) {
      filters.createdAt = { $and: { ...createdAfterCond, ...createdBeforeCond } } as any
    } else if (createdAfter !== undefined) {
      filters.createdAt = createdAfterCond
    } else if (createdBefore !== undefined) {
      filters.createdAt = createdBeforeCond
    }
  }
  if (streams !== undefined) {
    filters.streamId = { $in: streams }
  }
  if (classifications !== undefined) {
    filters.classification = { $in: classifications }
  }
  return filters
}

function combineOptions (o: IQueryOptions = {}): QueryOptions {
  const options: QueryOptions = {}
  const { limit, offset, sort } = o
  if (limit !== undefined) {
    options.limit = limit
  }
  if (offset !== undefined) {
    options.skip = offset
  }
  if (sort !== undefined) {
    options.sort = { [sort.field]: sort.order }
  }
  return options
}

export async function get (id: string): Promise<IEventModel | null> {
  return await Event.findById(id)
}

export async function getByExternalId (externalId: IEventModel['externalId']): Promise<IEventModel | null> {
  return await Event.findOne({ externalId })
}

export async function list (f: IEventFilters = {}, o: IQueryOptions = {}): Promise<IEventModel[]> {
  const filters = combineFilters(f)
  const options = combineOptions(o)
  return await Event.find(filters, null, options)
}

export async function count (f: IEventFilters = {}): Promise<number> {
  const filters = combineFilters(f)
  return await Event.count(filters)
}

export async function create (data: IEvent): Promise<IEventModel> {
  return await Event.create(data)
}

export async function deleteOne (id: IEventModel['_id']): Promise<DeleteResult> {
  return await Event.deleteOne({ _id: id })
}

export default { get, getByExternalId, create, deleteOne }
