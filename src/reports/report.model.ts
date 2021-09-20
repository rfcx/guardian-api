import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getModelForClass, prop, ReturnModelType, DocumentType, Ref, modelOptions } from '@typegoose/typegoose'
import { FilterQuery, QueryOptions } from 'mongoose'
import { User } from '../users/user.model'
import { Attachment, ReportsFilters, QueryOptionsRFCx } from '../types'

dayjs.extend(utc)

@modelOptions({ options: { allowMixed: 0 } })
export class Report {
  @prop({ required: true }) public guardianId?: string
  @prop({ required: true }) public encounteredAt?: Date
  @prop({ required: true, default: Date.now() }) public createdAt?: Date
  @prop({ required: true, default: Date.now() }) public updatedAt?: Date
  @prop({ required: true }) public isLoggerEncountered?: boolean
  @prop({ required: true }) public isEvidenceEncountered?: boolean
  @prop({ type: () => [String] }) public evidences?: string[]
  @prop({ required: true, enum: [0, 1, 2] }) public loggingScale?: number
  @prop({ required: true, enum: [0, 1, 2, 3] }) public damageScale?: number
  @prop({ type: () => [String] }) public responseActions?: string[]
  @prop() public attachments?: Attachment[]
  @prop() public note?: string
  @prop({ ref: () => User }) public user?: Ref<User>
  @prop({ required: true }) public schemaVersion?: number

  public static async get (this: ReturnModelType<typeof Report>, id: string): Promise<DocumentType<Report> | null> {
    return await this.findById(id)
  }

  public static async list (this: ReturnModelType<typeof Report>, f: ReportsFilters = {}, o: QueryOptionsRFCx = {}): Promise<Array<DocumentType<Report>>> {
    const filters: FilterQuery<DocumentType<Report>> = {}
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
      filters.user = {
        _id: { $in: users }
      } as any
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

    return await this.find(filters, null, options)
  }
}

export default getModelForClass(Report)
