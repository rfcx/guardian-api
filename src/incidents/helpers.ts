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
    closedAtIsNull, noResponses, closedAfter, closedBefore, streams, projects, classifications
  } = f
  applyTimeRangeToQuery(where, 'closedAt', closedAfter, closedBefore)
  if (closedAtIsNull !== undefined) {
    where.closedAt = { [closedAtIsNull ? Op.is : Op.ne]: null }
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
  if (classifications !== undefined) {
    where['$classification.id$'] = { [Op.in]: classifications }
  }
  return where
}

export default { combineWhere }
