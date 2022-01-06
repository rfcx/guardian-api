import { StreamFilters, QueryOptionsRFCx } from '../types'
import { Op } from 'sequelize'
import Stream from './stream.model'

export const list = async function (f: StreamFilters = {}, o: QueryOptionsRFCx = {}): Promise<Stream[]> {
  const where: Stream['_attributes'] = {}
  const { ids, lastEventEndNotNull } = f
  const { limit, offset, order } = o
  if (ids !== undefined) {
    where.id = { [Op.in]: ids }
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
