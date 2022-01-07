import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { StreamFilters, QueryOptionsRFCx } from '../types'
import { Op } from 'sequelize'
import Stream from './stream.model'

dayjs.extend(utc)

export const list = async function (f: StreamFilters = {}, o: QueryOptionsRFCx = {}): Promise<Stream[]> {
  const where: Stream['_attributes'] = {}
  const { ids, projects, lastEventEnd, lastEventEndNotNull } = f
  const { limit, offset, order } = o
  if (ids !== undefined) {
    where.id = { [Op.in]: ids }
  }
  if (projects !== undefined) {
    where.project_id = { [Op.in]: projects }
  }
  if (lastEventEnd !== undefined) {
    where.last_event_end = { [Op.gte]: dayjs.utc(lastEventEnd).valueOf() }
  }
  if (lastEventEndNotNull === true) {
    where.last_event_end = { [Op.ne]: null }
  }
  return await Stream.findAll({
    where,
    limit,
    offset: offset ?? 0,
    order: order !== undefined ? [[order.field, order.dir]] : [['last_event_end', 'DESC']]
  })
}

export default { list }
