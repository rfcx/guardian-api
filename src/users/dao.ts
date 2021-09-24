import User from './user.model'
import { Op } from 'sequelize'

export const getByGuidOrEmail = async function (guid: string, email: string): Promise<User | null> {
  return await User.findOne({ where: { [Op.or]: { email, guid } } })
}

export const create = async function (user: User): Promise<User> {
  return await User.create(user)
}
