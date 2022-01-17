import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op, FindOptions, WhereOptions, WhereAttributeHash, IncludeOptions, where, fn, col } from 'sequelize'
import { IncidentFilters, QueryOptionsRFCx } from '../types'
import Incident, { incidentAttributes } from './incident.model'
import Event from '../events/event.model'
import { applyTimeRangeToQuery } from '../common/db'
import { availableIncludes } from './misc'

dayjs.extend(utc)

export const combineWhere = function (f: IncidentFilters = {}): WhereOptions<any> {
  const where: WhereOptions<any> = {}
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

export const combineOptions = async function (f: IncidentFilters = {}, o: QueryOptionsRFCx = {}): Promise<FindOptions<Incident['_attributes']>> {
  const { limit, offset, order, fields, transaction } = o
  const hasFields = fields !== undefined && fields.length > 0
  const options: FindOptions<Incident['_attributes']> = {
    where: combineWhere(f),
    include: hasFields ? availableIncludes.filter(i => fields.includes(i.as)) : [],
    attributes: { include: hasFields ? incidentAttributes.full.filter(a => fields.includes(a)) : incidentAttributes.lite },
    limit: limit ?? 100,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['createdAt', 'DESC']],
    transaction
  }
  if (f.minEvents !== undefined) {
    const ids = (await Incident.findAll({
      attributes: ['id'],
      where: options.where,
      raw: true,
      include: [{ model: Event, as: 'events', attributes: [] }],
      having: where(fn('count', col('events.id')), { [Op.gte]: f.minEvents }),
      group: ['Incident.id'],
      order: options.order,
      transaction
    })).map(i => i.id);

    (options.where as WhereAttributeHash).id = {
      [Op.in]: ids
    }
  }
  if (f.firstEventStart !== undefined) {
    let firstEvent = (options.include as IncludeOptions[]).find(i => i.as === 'firstEvent')
    if (firstEvent === undefined) {
      (options.include as IncludeOptions[]).push({ ...availableIncludes.find(i => i.as === 'firstEvent') as IncludeOptions })
      firstEvent = (options.include as IncludeOptions[]).find(i => i.as === 'firstEvent') as IncludeOptions
    }
    if (firstEvent?.where === undefined) {
      (firstEvent).where = {}
    }
    (firstEvent.where as WhereAttributeHash).start = {
      [Op.gte]: f.firstEventStart
    }
    options.subQuery = false
  }
  return options
}

export default { combineWhere, combineOptions }
