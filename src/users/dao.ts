import User from './user.model'
import { Op, Transactionable } from 'sequelize'

export const getByGuidOrEmail = async function (guid: string, email: string, o: Transactionable = {}): Promise<User | null> {
  const transaction = o.transaction
  return await User.findOne({ where: { [Op.or]: { email, guid } }, transaction })
}

export const create = async function (user: User, o: Transactionable = {}): Promise<User> {
  const transaction = o.transaction
  return await User.create(user, { transaction })
}

export default { getByGuidOrEmail, create }
