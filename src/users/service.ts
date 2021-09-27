import User from './user.model'
import { getByGuidOrEmail, create } from './dao'

export async function ensureUserExists (user: User): Promise<User> {
  return await getByGuidOrEmail(user.guid, user.email) ?? await create(user)
}
