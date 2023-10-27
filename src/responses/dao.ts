import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op, Transactionable } from 'sequelize'
import { applyTimeRangeToQuery } from '../common/db'
import Response from './models/response.model'
import { ResponseFilters, ResponseCreationData, QueryOptionsRFCx } from '../types'
import ResponseAnswer from './models/response-answer.model'
import { availableIncludes } from './misc'

dayjs.extend(utc)

export const get = async function (id: string): Promise<Response | null> {
  return await Response.findByPk(id, {
    attributes: {
      exclude: ['updatedAt', 'schemaVersion', 'incidentId', 'createdById']
    },
    include: availableIncludes
  })
}

export const list = async (f: ResponseFilters = {}, o: QueryOptionsRFCx = {}): Promise<Response[]> => {
  const where: Response['_attributes'] = {}
  const { investigatedAfter, investigatedBefore, startedAfter, startedBefore, submittedAfter, submittedBefore, createdAfter, createdBefore, streams, users } = f
  const { limit, offset, order } = o
  applyTimeRangeToQuery(where, 'investigatedAt', investigatedAfter, investigatedBefore)
  applyTimeRangeToQuery(where, 'startedAt', startedAfter, startedBefore)
  applyTimeRangeToQuery(where, 'submittedAt', submittedAfter, submittedBefore)
  applyTimeRangeToQuery(where, 'creteadAt', createdAfter, createdBefore)
  if (streams !== undefined) {
    where.streamId = { [Op.in]: streams }
  }
  if (users !== undefined) {
    where[Op.and] = {
      [Op.or]: {
        '$createdBy.email$': { [Op.in]: users },
        '$createdBy.guid$': { [Op.in]: users }
      }
    }
  }
  return await Response.findAll({
    where,
    limit: limit ?? 100,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['createdAt', 'DESC']],
    attributes: {
      exclude: ['updatedAt']
    },
    include: availableIncludes
  })
}

export const create = async (data: ResponseCreationData, o: Transactionable = {}): Promise<Response> => {
  const transaction = o.transaction
  return await Response.create(data as any, { transaction })
}

export const assignAnswersByIds = async (responseId: string, answers: number[] = [], o: Transactionable = {}): Promise<void> => {
  const transaction = o.transaction
  const data = answers.map((e) => {
    return {
      responseId,
      answerId: e
    }
  })
  await ResponseAnswer.bulkCreate(data, { transaction })
}

export default { get, list, create }
