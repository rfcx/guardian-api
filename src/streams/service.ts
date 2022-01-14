import { StreamResponse, StreamResponseWithIncidents, StreamWithIncidentsQuery, StreamFilters } from '../types'
import { list, update } from './dao'
import incidentsDao from '../incidents/dao'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

function extractIds (streams): string[] {
  return streams.map(i => i.id)
}

export const filterbyActiveStreams = async (streams: StreamResponse[] | StreamResponseWithIncidents[], params?: StreamWithIncidentsQuery): Promise<StreamResponse[] | StreamResponseWithIncidents[]> => {
  const filters: StreamFilters = {
    ids: extractIds(streams)
  }
  // if (params?.incidentsHaveEventsAfter !== undefined) {
  //   filters.lastEventEnd = params.incidentsHaveEventsAfter.valueOf()
  // } else {
  //   filters.lastEventEndNotNull = true
  // }
  if (params?.hasNewEvents === true) {
    filters.lastEventEndAfter = dayjs.utc().subtract(6, 'hours').toDate()
  }
  if (params?.hasHotIncident !== undefined) {
    filters.minLastIncidentEventsCount = 10
  }
  if (params?.includeClosedIncidents !== true) {
    filters.hasOpenIncident = true
  }
  const activeStreams = await list(filters)
  const activeStreamIds = extractIds(activeStreams)
  return streams
    .filter(s => activeStreamIds.includes(s.id))
    .sort((a, b) => {
      const strA = activeStreams.find(s => s.id === a.id)
      const strB = activeStreams.find(s => s.id === b.id)
      if (strA === undefined || strB === undefined) {
        return 0
      }
      return new Date(strB.lastEventEnd).valueOf() - new Date(strA.lastEventEnd).valueOf()
    })
}

export const refreshOpenIncidentsCount = async (id: string): Promise<void> => {
  const openedIncidents = await incidentsDao.count({ streams: [id], isClosed: false })
  console.log('\n\nopenedIncidents', openedIncidents, openedIncidents > 0, '\n\n')
  return await update(id, { hasOpenIncident: openedIncidents > 0 })
}

export default { filterbyActiveStreams, refreshOpenIncidentsCount }
