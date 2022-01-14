import { StreamResponse, StreamResponseWithIncidents, StreamResponseWithTags, StreamWithIncidentsQuery, StreamFilters } from '../types'
import { list, update } from './dao'
import incidentsDao from '../incidents/dao'
import { limitAndOffset } from '../common/page'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
const hoursForIsNew = 6
const eventsForHot = 10

dayjs.extend(utc)

function extractIds (streams): string[] {
  return streams.map(i => i.id)
}

export const preprocessByActiveStreams = async (streams: StreamResponse[], params?: StreamWithIncidentsQuery): Promise<{ total: number, items: StreamResponse[] | StreamResponseWithIncidents[] }> => {
  const filters: StreamFilters = {
    ids: extractIds(streams)
  }
  if (params?.hasNewEvents === true) {
    filters.lastEventEndAfter = dayjs.utc().subtract(hoursForIsNew, 'hours').toDate()
  }
  if (params?.hasHotIncident !== undefined) {
    filters.minLastIncidentEventsCount = eventsForHot
  }
  if (params?.includeClosedIncidents !== true) {
    filters.hasOpenIncident = true
  }
  const activeStreams = await list(filters)
  const activeStreamIds = extractIds(activeStreams)
  let items = streams
    .filter(s => activeStreamIds.includes(s.id))
    .sort((a, b) => {
      const strA = activeStreams.find(s => s.id === a.id)
      const strB = activeStreams.find(s => s.id === b.id)
      if (strA === undefined || strB === undefined) {
        return 0
      }
      return new Date(strB.lastEventEnd).valueOf() - new Date(strA.lastEventEnd).valueOf()
    })
  const total = items.length
  if (params?.limit !== undefined && params?.offset !== undefined) {
    items = limitAndOffset(items, params.limit, params.offset)
  }
  items = items.map((s: StreamResponse): StreamResponseWithTags => {
    const item = s as StreamResponseWithTags
    item.tags = []
    const activeStream = activeStreams.find(active => s.id === active.id)
    if (activeStream === undefined) {
      return item
    }
    const isNew = dayjs.utc(activeStream.lastEventEnd).isAfter(dayjs.utc().subtract(hoursForIsNew, 'hours'))
    const isHot = activeStream.lastIncidentEventsCount >= eventsForHot
    if (isNew) {
      item.tags.push('new')
    }
    if (isHot) {
      item.tags.push('hot')
    }
    return item
  })
  return { total, items }
}

export const refreshOpenIncidentsCount = async (id: string): Promise<void> => {
  const openedIncidents = await incidentsDao.count({ streams: [id], isClosed: false })
  return await update(id, { hasOpenIncident: openedIncidents > 0 })
}

export default { preprocessByActiveStreams, refreshOpenIncidentsCount }
