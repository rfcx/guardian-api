import { ResponsePayload } from '../types'
import { ensureUserExists } from '../users/service'
import { sequelize } from '../common/db'
import User from '../users/user.model'
import Response from './models/response.model'
import { create, assignEvidencesByIds, assignActionsByIds } from './dao'

export const createResponse = async (responseData: ResponsePayload, userData: User): Promise<Response> => {
  const user = await ensureUserExists(userData)
  return await sequelize.transaction(async (transaction) => {
    const response = await create({
      ...responseData,
      createdById: user.id,
      schemaVersion: 1
    }, transaction)
    if (responseData.evidences?.length !== 0) {
      await assignEvidencesByIds(response.id, responseData.evidences)
    }
    if (responseData.responseActions?.length !== 0) {
      await assignActionsByIds(response.id, responseData.responseActions)
    }
    return response
  })
}

export default { createResponse }
