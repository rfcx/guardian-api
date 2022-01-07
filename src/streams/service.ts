import { StreamResponse } from '../types'
import { list } from './dao'

function extractIds (streams): string[] {
  return streams.map(i => i.id)
}

export const filterbyActiveStreams = async (streams: StreamResponse[]): Promise<StreamResponse[]> => {
  const activeStreams = await list({ ids: extractIds(streams), lastEventEndNotNull: true })
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

export default { filterbyActiveStreams }
