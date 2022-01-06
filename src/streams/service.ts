import { StreamResponse } from '../types'
import { list } from './dao'

function extractIds (streams): string[] {
  return streams.map(i => i.id)
}

export const filterActiveStreams = async (streams: StreamResponse[]): Promise<StreamResponse[]> => {
  console.log('\n\nfilterActiveStreams', streams, '\n\n')
  const activeStreams = extractIds(await list({ ids: extractIds(streams), lastEventEndNotNull: true }))
  console.log('\n\nactiveStreams', activeStreams, '\n\n')
  return streams.filter(s => activeStreams.includes(s.id))
}

export default { filterActiveStreams }
