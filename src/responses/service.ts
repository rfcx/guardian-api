import { Transaction, Transactionable } from 'sequelize'
import { ResponsePayload, ResponseFormatted, GroupedAnswers } from '../types'
import { ensureUserExists } from '../users/service'
import { sequelize } from '../common/db'
import User from '../users/user.model'
import Response from './models/response.model'
import Answer from './models/answer.model'
import { create, list, get, assignAnswersByIds } from './dao'
import incidentsDao from '../incidents/dao'
import { findOrCreateIncidentForResponse, shiftEventsAfterNewResponse } from '../incidents/service'
import { assetPath, generateFilename } from '../common/storage/paths'
import { uploadFile } from '../common/storage'
import assetDao from '../assets/dao'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { EmptyResultError } from '@rfcx/http-utils'

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

export const getResponse = async (id: string): Promise<ResponseFormatted> => {
  return await get(id)
    .then((response) => {
      if (response === null) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new EmptyResultError('Response with given id not found')
      } else {
        return format(response)
      }
    })
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
    if (responseData.answers?.length !== 0) {
      await assignAnswersByIds(response.id, responseData.answers, { transaction })
    }
    if (responseData.note !== undefined && responseData.note.length > 0) {
      await uploadFileAndSaveToDb(response, {
        buffer: Buffer.from(responseData.note, 'utf8'),
        originalname: `note-${response.id}.txt`,
        mimetype: 'text/plain'
      }, userData, { transaction })
    }
    await shiftEventsAfterNewResponse(incidentForResponse, response, { transaction })
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

export const format = (response: Response): ResponseFormatted => {
  const {
    id, streamId, projectId, investigatedAt, startedAt, submittedAt,
    createdAt, createdBy, answers, incident
  } = response
  const questions: any = answers.reduce((acc: any, cur: Answer) => {
    const questionId = cur.question.id
    if (acc[questionId] === undefined) {
      acc[questionId] = {
        question: cur.question,
        items: []
      }
    }
    const { id, text, picture } = cur
    acc[questionId].items.push({ id, text, picture })
    return acc
  }, {})
  const groupedAnswers = Object.values(questions)
  return {
    id,
    streamId,
    projectId,
    investigatedAt: investigatedAt.toISOString(),
    startedAt: startedAt.toISOString(),
    submittedAt: submittedAt.toISOString(),
    createdAt: createdAt.toISOString(),
    createdBy,
    answers: groupedAnswers as GroupedAnswers[],
    incident: incident as any
  }
}

export default { getLastResponseForStream, createResponse, uploadFileAndSaveToDb, format }
