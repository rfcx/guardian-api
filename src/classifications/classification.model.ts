import { getModelForClass, prop, ReturnModelType, DocumentType } from '@typegoose/typegoose'
import { FilterQuery, QueryOptions } from 'mongoose'
import { ClassificationFilters, QueryOptionsRFCx } from '../types'

export class Classification {
  @prop({ required: true, unique: true }) public value?: string
  @prop({ required: true }) public title?: string

  public static async ensureExists (this: ReturnModelType<typeof Classification>, classification: Classification): Promise<DocumentType<Classification>> {
    return await this.findOne({ value: classification.value }) ?? await this.create(classification)
  }

  public static async list (this: ReturnModelType<typeof Classification>, f: ClassificationFilters = {}, o: QueryOptionsRFCx = {}): Promise<Array<DocumentType<Classification>>> {
    const filters: FilterQuery<DocumentType<Classification>> = {}
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
    return await this.find(filters, null, options)
  }
}

export default getModelForClass(Classification)
