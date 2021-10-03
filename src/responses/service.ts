import { Transaction } from 'sequelize'
import { ResponsePayload } from '../types'
import { ensureUserExists } from '../users/service'
import { sequelize } from '../common/db'
import User from '../users/user.model'
import Response from './models/response.model'
import { create, list, assignEvidencesByIds, assignActionsByIds } from './dao'
import incidentsDao from '../incidents/dao'
import { findOrCreateIncidentForResponse } from '../incidents/service'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const getLastResponseForStream = async (streamId: string): Promise<Response | null> => {
  const responses = await list({
    streams: [streamId]
  }, {
    limit: 1,
    order: {
      field: 'createdAt',
      dir: 'DESC'
    }
  })
  return responses.length !== 0 ? responses[0] : null
}

export const createResponse = async (responseData: ResponsePayload, userData: User): Promise<Response> => {
  const user = await ensureUserExists(userData)
  return await sequelize.transaction(async (transaction: Transaction) => {
    const incidentForResponse = await findOrCreateIncidentForResponse(responseData)
    const response = await create({
      ...responseData,
      createdById: user.id,
      incidentId: incidentForResponse.id,
      schemaVersion: 1
    }, { transaction })
    if (incidentForResponse.firstResponse === null) {
      await incidentsDao.update(incidentForResponse.id, { firstResponseId: response.id }, { transaction })
    }
    if (responseData.evidences?.length !== 0) {
      await assignEvidencesByIds(response.id, responseData.evidences, { transaction })
    }
    if (responseData.responseActions?.length !== 0) {
      await assignActionsByIds(response.id, responseData.responseActions, { transaction })
    }
    return response
  })
}

export default { createResponse }
