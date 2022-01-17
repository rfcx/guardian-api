import { Transactionable } from 'sequelize'
import User from './user.model'
import { getByGuidOrEmail, create } from './dao'

export async function ensureUserExists (user: User, o: Transactionable = {}): Promise<User> {
  return await getByGuidOrEmail(user.guid, user.email, o) ?? await create(user, o)
}
