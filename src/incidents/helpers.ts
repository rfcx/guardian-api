import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op } from 'sequelize'
import { IncidentFilters } from '../types'
import Incident from './incident.model'
import { applyTimeRangeToQuery } from '../common/db'

dayjs.extend(utc)

export const combineWhere = function (f: IncidentFilters = {}): Incident['_attributes'] {
  const where: Incident['_attributes'] = {}
  const {
    isClosed, noResponses, closedAfter, closedBefore, streams, projects
  } = f
  applyTimeRangeToQuery(where, 'closedAt', closedAfter, closedBefore)
  if (isClosed !== undefined) {
    where.closedAt = { [isClosed ? Op.ne : Op.is]: null }
  }
  if (noResponses !== undefined) {
    where.firstResponseId = { [Op.is]: null }
  }
  if (streams !== undefined) {
    where.streamId = { [Op.in]: streams }
  }
  if (projects !== undefined) {
    where.projectId = { [Op.in]: projects }
  }
  return where
}

export default { combineWhere }
