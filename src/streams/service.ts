import { StreamResponse, StreamResponseWithEventsCount } from '../types'
import ReportModel from '../reports/report.model'
import { countEvents } from '../events/service'

export const getEventsCountSinceLastReport = async (streams: StreamResponse[]): Promise<void> => {
  for (const stream of streams as StreamResponseWithEventsCount[]) {
    const reports = await ReportModel.list({
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
