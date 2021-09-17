import { getModelForClass, prop, ReturnModelType, DocumentType } from '@typegoose/typegoose'

export class User {
  @prop({ required: true }) public firstname?: string
  @prop({ required: true }) public lastname?: string
  @prop({ required: true, unique: true }) public guid?: string
  @prop({ required: true, unique: true }) public email?: string

  public static async getByGuidOrEmail (this: ReturnModelType<typeof User>, guid?: string, email?: string): Promise<DocumentType<User> | null> {
    return await this.findOne({ $or: [{ guid }, { email }] })
  }
}

export default getModelForClass(User)
