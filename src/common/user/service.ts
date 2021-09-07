import { IUser } from './types'
import { getByGuidOrEmail, create } from './dao'

export async function ensureUserExists (user: IUser): Promise<IUser> {
  return await getByGuidOrEmail(user.guid, user.email) ?? await create(user)
}
