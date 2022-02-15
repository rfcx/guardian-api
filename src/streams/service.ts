import { Transactionable } from 'sequelize'
import { StreamResponse, StreamResponseWithTags, StreamWithIncidentsQuery, StreamFilters } from '../types'
import { list, update, findOrCreateGuardianType } from './dao'
import incidentsDao from '../incidents/dao'
import { limitAndOffset } from '../common/page'
import { getGuardian } from '../common/core-api'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
const hoursForIsNew = 6
const eventsForHot = 10

dayjs.extend(utc)

function extractIds (streams): string[] {
  return streams.map(i => i.id)
}

export const preprocessByActiveStreams = async (streams: StreamResponse[], params?: StreamWithIncidentsQuery): Promise<{ total: number, items: StreamResponseWithTags[] }> => {
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
  const filteredStreams = streams
    .filter(s => activeStreamIds.includes(s.id))
    .sort((a, b) => {
      const strA = activeStreams.find(s => s.id === a.id)
      const strB = activeStreams.find(s => s.id === b.id)
      if (strA === undefined || strB === undefined) {
        return 0
      }
      return new Date(strB.lastEventEnd).valueOf() - new Date(strA.lastEventEnd).valueOf()
    })
  const total = filteredStreams.length
  const pagedStreams = (params?.limit !== undefined && params?.offset !== undefined) ? limitAndOffset(filteredStreams, params.limit, params.offset) : filteredStreams
  const streamsWithTags = pagedStreams.map<StreamResponseWithTags>((s: StreamResponse) => {
    const item = s as StreamResponseWithTags
    // TODO: delete next two lines when Core API will handle dotted fields like `project.id`, `project.name`
    delete item.project?.externalId
    delete item.project?.isPublic
    item.tags = []
    const activeStream = activeStreams.find(active => s.id === active.id)
    if (activeStream === undefined) {
      return item
    }
    item.guardianType = activeStream.guardianType?.title
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
  return { total, items: streamsWithTags }
}

export const fillGuardianType = async (streams: StreamResponseWithTags[]): Promise<StreamResponseWithTags[]> => {
  for (const stream of streams) {
    if (stream.guardianType === undefined) {
      const guardianType = await syncGuardianTypeFromCore(stream.id)
      stream.guardianType = guardianType
    }
  }
  return streams
}

export const refreshOpenIncidentsCount = async (id: string, o: Transactionable = {}): Promise<void> => {
  const openedIncidents = await incidentsDao.count({ streams: [id], isClosed: false }, o)
  return await update(id, { hasOpenIncident: openedIncidents > 0 }, o)
}

export const syncGuardianTypeFromCore = async (id: string): Promise<string | null> => {
  const guardianTypeTitle = await getGuardianTypeFromCore(id)
  if (guardianTypeTitle !== null && guardianTypeTitle !== undefined) {
    await findOrCreateGuardianType(guardianTypeTitle)
    await update(id, { guardianType: guardianTypeTitle })
  }
  return guardianTypeTitle
}

export const getGuardianTypeFromCore = async (id: string): Promise<string | null> => {
  try {
    const guardian = await getGuardian(id)
    return guardian?.data?.type
  } catch (e) {
    return null
  }
}

export default { preprocessByActiveStreams, refreshOpenIncidentsCount }
