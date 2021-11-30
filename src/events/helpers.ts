import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op } from 'sequelize'
import { EventFilters } from '../types'
import Event from './event.model'
import { applyTimeRangeToQuery } from '../common/db'

dayjs.extend(utc)

export const combineWhere = function (f: EventFilters = {}): Event['_attributes'] {
  const where: Event['_attributes'] = {}
  const { ids, start, end, createdAfter, createdBefore, streams, incidents, classifications } = f
  applyTimeRangeToQuery(where, 'start', start, end)
  applyTimeRangeToQuery(where, 'createdAt', createdAfter, createdBefore)
  if (ids !== undefined) {
    where.id = { [Op.in]: ids }
  }
  if (streams !== undefined) {
    where.streamId = { [Op.in]: streams }
  }
  if (incidents !== undefined) {
    where.incidentId = { [Op.in]: incidents }
  }
  if (classifications !== undefined) {
    where['$classification.id$'] = { [Op.in]: classifications }
  }
  return where
}

export default { combineWhere }
