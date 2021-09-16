import { UserDao, UserModel } from './types'
import User from './user.model'

export async function getByGuidOrEmail (guid: UserDao['guid'], email: UserDao['email']): Promise<UserModel | null> {
  return await User.findOne({ $or: [{ guid }, { email }] })
}

export async function create (data: UserDao): Promise<UserModel> {
  return await User.create(data)
}
