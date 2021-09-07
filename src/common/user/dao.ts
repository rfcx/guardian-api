import { IUser } from './types'
import User from './user.model'

export async function getByGuidOrEmail (guid: IUser['guid'], email: IUser['email']): Promise<IUser | null> {
  return await User.findOne({ $or: [{ guid }, { email }] })
}

export async function create (data: IUser): Promise<IUser> {
  return await User.create(data)
}
