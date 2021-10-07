import { Transaction, Transactionable } from 'sequelize'
import { ResponsePayload } from '../types'
import { ensureUserExists } from '../users/service'
import { sequelize } from '../common/db'
import User from '../users/user.model'
import Response from './models/response.model'
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
    if (responseData.note !== undefined) {
      await uploadFileAndSaveToDb(response, {
        buffer: Buffer.from(responseData.note, 'utf8'),
        originalname: `note-${response.id}.txt`,
        mimetype: 'text/plain'
      }, userData, { transaction })
    }
    return response
  })
}

export const uploadFileAndSaveToDb = async (response: Response, file: any, userData: User, o: Transactionable = {}): Promise<string> => {
  const isExternalTransaction = o.transaction !== undefined && o.transaction !== null
  const transaction = isExternalTransaction ? o.transaction : await sequelize.transaction()
  if (file === null) {
    throw new Error('File should not be null')
  }
  try {
    const user = await ensureUserExists(userData)
    const buf = file.buffer
    const fileName = generateFilename(file.originalname)
    const mimeType = file.mimetype
    const newAsset = { fileName, mimeType, responseId: response.id, createdById: user.id }
    const asset = await assetDao.create(newAsset, { transaction })
    const remotePath = assetPath(asset)
    await uploadFile(remotePath, buf)
    if (!isExternalTransaction) {
      await (transaction as any).commit()
    }
    return asset.id
  } catch (error: unknown) {
    if (!isExternalTransaction) {
      await (transaction as any).rollback()
    }
    throw new Error((error as Error).message ?? error)
  }
}

export default { getLastResponseForStream, createResponse, uploadFileAndSaveToDb }
