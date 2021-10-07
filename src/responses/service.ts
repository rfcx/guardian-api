import { Transaction } from 'sequelize'
import { ResponsePayload } from '../types'
import { ensureUserExists } from '../users/service'
import { sequelize } from '../common/db'
import User from '../users/user.model'
import Response from './models/response.model'
import Asset from '../assets/asset.model'
import { create, list, assignEvidencesByIds, assignActionsByIds } from './dao'
import incidentsDao from '../incidents/dao'
import { findOrCreateIncidentForResponse } from '../incidents/service'
import { assetPath, generateFilename } from '../common/storage/paths'
import { uploadFile } from '../common/storage'
import assetDao from '../assets/dao'
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

export const uploadFileAndSaveToDb = async (response: Response, file: any, userData: User): Promise<string> => {
  const transaction = await sequelize.transaction()
  if (file === null) {
    throw new Error('File should not be null')
  }
  try {
    const user = await ensureUserExists(userData)
    const buf = file.buffer
    const fileName = generateFilename(file.originalname)
    const mimeType = file.mimetype
    const newAsset = { fileName, mimeType, responseId: response.id, createdById: user.id }
    let asset = await assetDao.create(newAsset, { transaction })
    asset = await assetDao.get(asset.id) as Asset // reload model to get nested response model
    const remotePath = assetPath(asset)
    await uploadFile(remotePath, buf)
    await transaction.commit()
    return asset.id
  } catch (error: unknown) {
    await transaction.rollback()
    throw new Error((error as Error).message ?? error)
  }
}

export default { createResponse }
