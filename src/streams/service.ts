import { IStreamResponse, IStreamResponseWithEventsCount } from '../types'
import reportsDao from '../reports/dao'
import { countEvents } from '../events/service'

export const getEventsCountSinceLastReport = async (streams: IStreamResponse[]): Promise<void> => {
  for (const stream of streams as IStreamResponseWithEventsCount[]) {
    const reports = await reportsDao.list({
      guardians: [stream.id]
    }, {
      limit: 1,
      sort: {
        field: 'createdAt',
        order: 'desc'
      }
    })
    const lastReport = reports[0]
    stream.eventsCount = await countEvents({
      streams: [stream.id],
      ...lastReport !== undefined ? { createdAfter: lastReport.createdAt } : {}
    })
  }
}
