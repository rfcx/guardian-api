import { IUser, IUserModel } from './types'
import { getByGuidOrEmail, create } from './dao'

export async function ensureUserExists (user: IUser): Promise<IUserModel> {
  return await getByGuidOrEmail(user.guid, user.email) ?? await create(user)
}
