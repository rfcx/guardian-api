import UserModel, { User } from './user.model'
import { DocumentType } from '@typegoose/typegoose'

export async function ensureUserExists (user: User): Promise<DocumentType<User>> {
  return await UserModel.getByGuidOrEmail(user.guid, user.email) ?? await UserModel.create(user)
}
