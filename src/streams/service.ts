import { StreamResponse, StreamResponseWithEventsCount } from '../types'
import responseDao from '../responses/dao'
import eventDao from '../events/dao'

export const getEventsCountSinceLastReport = async (streams: StreamResponse[]): Promise<void> => {
  for (const stream of streams as StreamResponseWithEventsCount[]) {
    const reports = await responseDao.list({
      guardians: [stream.id]
    }, {
      limit: 1,
      order: {
        field: 'created_at',
        dir: 'DESC'
      }
    })
    const lastReport = reports[0]
    stream.eventsCount = await eventDao.count({
      streams: [stream.id],
      ...lastReport !== undefined ? { createdAfter: lastReport.createdAt } : {}
    })
  }
}
