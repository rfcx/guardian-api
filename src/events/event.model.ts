import { getModelForClass, prop, ReturnModelType, DocumentType, Ref } from '@typegoose/typegoose'
import { Classification } from '../classifications/classification.model'
import { EventFilters, QueryOptionsRFCx } from '../types'
import { combineFilters, combineOptions } from './helpers'

export class Event {
  @prop({ required: true, unique: true }) public externalId?: string
  @prop({ required: true }) public start?: Date
  @prop({ required: true }) public end?: Date
  @prop({ required: true }) public streamId?: string
  @prop({ ref: () => Classification }) public classification?: Ref<Classification>
  @prop({ required: true }) public createdAt?: Date

  public static async get (this: ReturnModelType<typeof Event>, id: string): Promise<DocumentType<Event> | null> {
    return await this.findById(id)
  }

  public static async getByExternalId (this: ReturnModelType<typeof Event>, externalId: string): Promise<DocumentType<Event> | null> {
    return await this.findOne({ externalId })
  }

  public static async list (this: ReturnModelType<typeof Event>, f: EventFilters = {}, o: QueryOptionsRFCx = {}): Promise<Array<DocumentType<Event>>> {
    const filters = combineFilters(f)
    const options = combineOptions(o)
    return await this.find(filters, null, options)
  }

  public static async total (this: ReturnModelType<typeof Event>, f: EventFilters = {}): Promise<number> {
    const filters = combineFilters(f)
    return await this.count(filters)
  }
}

export default getModelForClass(Event)
