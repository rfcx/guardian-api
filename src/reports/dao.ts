import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { FilterQuery, QueryOptions, UpdateWriteOpResult } from 'mongoose'
import { DeleteResult } from 'mongodb'
import { IQueryOptions } from '../types'
import { IReportsFilters, IReportModel, IReportCreationData, IReportUpdatableData } from './types'
import Report from './report.model'

dayjs.extend(utc)

export async function get (id: string): Promise<IReportModel | null> {
  return await Report.findById(id)
}

export async function list (f: IReportsFilters = {}, o: IQueryOptions = {}): Promise<IReportModel[]> {
  const filters: FilterQuery<IReportModel> = {}
  const options: QueryOptions = {}
  const { start, end, guardians, users } = f
  const { limit, offset, sort } = o
  if (start !== undefined || end !== undefined) {
    const startCond: object = { $gte: dayjs.utc(start).valueOf() } ?? undefined
    const endCond: object = { $lt: dayjs.utc(end).valueOf() } ?? undefined
    if (start !== undefined && end !== undefined) {
      filters.encounteredAt = { $and: { ...startCond, ...endCond } } as any
    } else if (start !== undefined) {
      filters.encounteredAt = startCond
    } else if (end !== undefined) {
      filters.encounteredAt = endCond
    }
  }
  if (guardians !== undefined) {
    filters.guardianId = { $in: guardians }
  }
  if (users !== undefined) {
    filters.user._id = { $in: users }
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

  return await Report.find(filters, null, options)
}

export async function create (data: IReportCreationData): Promise<IReportModel> {
  return await Report.create(data)
}

export async function update (id: IReportModel['_id'], data: IReportUpdatableData): Promise<UpdateWriteOpResult> {
  return await Report.where({ _id: id }).update(data)
}

export async function deleteOne (id: IReportModel['_id']): Promise<DeleteResult> {
  return await Report.deleteOne({ _id: id })
}

export default { get, list, create, update, deleteOne }
