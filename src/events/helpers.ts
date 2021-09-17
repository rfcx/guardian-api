import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { FilterQuery, QueryOptions } from 'mongoose'
import { DocumentType } from '@typegoose/typegoose'
import { EventFilters, QueryOptionsRFCx } from '../types'
import { Event } from './event.model'

dayjs.extend(utc)

export const combineFilters = function (f: EventFilters = {}): FilterQuery<DocumentType<Event>> {
  const filters: FilterQuery<DocumentType<Event>> = {}
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

export const combineOptions = function (o: QueryOptionsRFCx = {}): QueryOptions {
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

export default { combineFilters, combineOptions }
