import { Transactionable } from 'sequelize'
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
    // TODO: delete next two lines when Core API will handle dotted fields like `project.id`, `project.name`
    delete item.project?.externalId
    delete item.project?.isPublic
    item.tags = []
    const activeStream = activeStreams.find(active => s.id === active.id)
    if (activeStream === undefined) {
      return item
    }
    const isRecent = dayjs.utc(activeStream.lastEventEnd).isAfter(dayjs.utc().subtract(hoursForIsNew, 'hours'))
    const isHot = activeStream.lastIncidentEventsCount >= eventsForHot
    const isOpen = activeStream.hasOpenIncident
    if (isRecent) {
      item.tags.push('recent')
    }
    if (isHot) {
      item.tags.push('hot')
    }
    if (isOpen) {
      item.tags.push('open')
    }
    return item
  })
  return { total, items }
}

export const refreshOpenIncidentsCount = async (id: string, o: Transactionable = {}): Promise<void> => {
  const openedIncidents = await incidentsDao.count({ streams: [id], isClosed: false }, o)
  return await update(id, { hasOpenIncident: openedIncidents > 0 }, o)
}

export default { preprocessByActiveStreams, refreshOpenIncidentsCount }
