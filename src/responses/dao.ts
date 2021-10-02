import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op, Transactionable } from 'sequelize'
import { applyTimeRangeToQuery } from '../common/db'
import Response from './models/response.model'
import { ResponseFilters, ResponseCreationData, QueryOptionsRFCx } from '../types'
import ResponseEvidence from './models/response-evidence.model'
import ResponseAction from './models/response-action.model'

dayjs.extend(utc)

export const get = async function (id: string): Promise<Response | null> {
  return await Response.findByPk(id, {
    attributes: {
      exclude: ['updatedAt']
    }
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
        '$user.email$': { [Op.in]: users },
        '$user.guid$': { [Op.in]: users }
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
    include: [{ all: true }]
  })
}

export const create = async (data: ResponseCreationData, o: Transactionable = {}): Promise<Response> => {
  const transaction = o.transaction
  return await Response.create(data, { transaction })
}

export const assignEvidencesByIds = async (responseId: string, evidences: number[] = [], o: Transactionable = {}): Promise<void> => {
  const transaction = o.transaction
  const data = evidences.map((e) => {
    return {
      responseId,
      evidenceId: e
    }
  })
  await ResponseEvidence.bulkCreate(data, { transaction })
}

export const assignActionsByIds = async (responseId: string, actions: number[] = [], o: Transactionable = {}): Promise<void> => {
  const transaction = o.transaction
  const data = actions.map((e) => {
    return {
      responseId,
      actionId: e
    }
  })
  await ResponseAction.bulkCreate(data, { transaction })
}

export default { get, list, create }
