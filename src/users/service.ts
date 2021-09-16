import { UserDao, UserModel } from './types'
import { getByGuidOrEmail, create } from './dao'

export async function ensureUserExists (user: UserDao): Promise<UserModel> {
  return await getByGuidOrEmail(user.guid, user.email) ?? await create(user)
}
