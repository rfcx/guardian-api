import Asset from '../assets/asset.model'
import Response from '../responses/models/response.model'
import User from '../users/user.model'
import { validate as uuidValidate } from 'uuid'
import { Transactionable } from 'sequelize'
import { AssetCreationData, QueryOptionsRFCx } from '../types'

export async function create (newAsset: AssetCreationData, o: Transactionable = {}): Promise<Asset> {
  const transaction = o.transaction
  return await Asset.create(newAsset as any, { transaction })
}

export async function get (id: string): Promise<Asset | null> {
  if (!uuidValidate(id)) {
    return null
  }
  return await Asset.findByPk(id, { include: [{ all: true }] })
}

export async function query (filters: { responseId?: string, deploymentId?: string }, o: QueryOptionsRFCx = {}): Promise<Asset[]> {
  const { limit, offset } = o
  return await Asset.findAll({
    where: filters,
    limit: limit ?? 100,
    offset: offset ?? 0,
    attributes: {
      exclude: ['responseId', 'createdById', 'updatedAt', 'deletedAt']
    },
    include: [
      { model: Response, as: 'response', attributes: ['id'] },
      { model: User, as: 'createdBy', attributes: { exclude: ['id'] } }
    ]
  })
}

export async function remove (id: string): Promise<number> {
  return await Asset.destroy({ where: { id } })
}

export default { create, get, query, remove }
