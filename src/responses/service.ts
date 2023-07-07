import { Transaction, Transactionable } from 'sequelize'
import { ResponsePayload, ResponseFormatted, GroupedAnswers, AssetFileAttributes } from '../types'
import { ensureUserExists } from '../users/service'
import { sequelize } from '../common/db'
import User from '../users/user.model'
import Response from './models/response.model'
import Answer from './models/answer.model'
import { create, list, get, assignAnswersByIds } from './dao'
import incidentsDao from '../incidents/dao'
import { findOrCreateIncidentForResponse, shiftEventsAfterNewResponse } from '../incidents/service'
import { assetPath, uniquifyFilename } from '../common/storage/paths'
import { uploadFile } from '../common/storage'
import assetDao from '../assets/dao'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { EmptyResultError } from '@rfcx/http-utils'
import { convert } from '../common/audio/ffmpeg'
import { join } from 'path'
import { unlinkAsync } from '../common/fs'

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

export const uploadFileAndSaveToDb = async (response: Response, file: AssetFileAttributes, userData: User, o: Transactionable = {}): Promise<string> => {
  const isExternalTransaction = o.transaction !== undefined && o.transaction !== null
  const transaction = isExternalTransaction ? o.transaction : await sequelize.transaction()
  try {
    const user = await ensureUserExists(userData)
    const { mimetype, originalname, buffer } = file
    const createdAt = new Date()
    const uniquifiedFilename = uniquifyFilename(originalname)
    const newAssetData = { fileName: uniquifiedFilename, mimeType: mimetype, responseId: response.id, createdById: user.id, createdAt }
    // There wree some compatibility issues with playing voice recordings in Safari.
    // So if asset is audio, save original file in storage and convert original file to mp3
    if (mimetype.startsWith('audio')) {
      const sourceRemotePath = assetPath({ createdAt, responseId: response.id, fileName: `source-${uniquifiedFilename}` })
      await uploadFile(sourceRemotePath, file.path as string) // upload original audio file just in case
      const convFileName = `converted-${uniquifiedFilename}`
      const dest = join(file.destination as string, convFileName)
      await convert(file.path as string, dest, { acodec: 'libmp3lame' }) // convert audio file to mp3 with ffmpeg
      const remotePath = assetPath({ createdAt, responseId: response.id, fileName: convFileName })
      newAssetData.fileName = convFileName // rewrite asset filename
      await uploadFile(remotePath, dest)
      await unlinkAsync(file.path as string) // delete temp request file
      await unlinkAsync(dest) // delete converted file
    } else {
      const remotePath = assetPath({ createdAt, responseId: response.id, fileName: uniquifiedFilename })
      await uploadFile(remotePath, buffer !== undefined ? buffer : file.path as string)
    }
    const asset = await assetDao.create(newAssetData, { transaction })
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
    isUnexpected, createdAt, createdBy, answers, incident
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
    isUnexpected,
    createdAt: createdAt.toISOString(),
    createdBy,
    answers: groupedAnswers as GroupedAnswers[],
    incident: incident as any
  }
}

export default { getLastResponseForStream, createResponse, uploadFileAndSaveToDb, format }
