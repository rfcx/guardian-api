import MockAdapter from 'axios-mock-adapter'
import { instance, coreApiAxios, noncoreApiAxios, mediaApiAxios } from './index'

type adapterType = 'core' | 'noncore' | 'media' | 'default'

export const GET = 'GET'
export const POST = 'POST'
export const PATCH = 'PATCH'

const mockAdapterDefault = new MockAdapter(instance)
const mockAdapterCore = new MockAdapter(coreApiAxios)
const mockAdapterNoncore = new MockAdapter(noncoreApiAxios)
const mockAdapterMedia = new MockAdapter(mediaApiAxios)

export function setupMockAxios (type: adapterType, request: string, endpoint: string, status: number, mockResponse?: any, headers?: any): MockAdapter | undefined {
  const mockAdapter = getMockAdapter(type)
  if (request === GET) {
    const mock = mockAdapter.onGet(`/${endpoint}`)
    mock.reply(status, mockResponse, headers)
  }
  if (request === POST) {
    const mock = mockAdapter.onPost(`/${endpoint}`)
    mock.reply(status, mockResponse, headers)
  }
  if (request === PATCH) {
    const mock = mockAdapter.onPatch(`/${endpoint}`)
    mock.reply(status, mockResponse, headers)
  }
  return mockAdapter
}

export function resetMockAxios (type: adapterType = 'default'): void {
  getMockAdapter(type).reset()
}

function getMockAdapter (type: adapterType): MockAdapter {
  let mockAdapter
  switch (type) {
    case 'core':
      mockAdapter = mockAdapterCore
      break
    case 'noncore':
      mockAdapter = mockAdapterNoncore
      break
    case 'media':
      mockAdapter = mockAdapterMedia
      break
    default:
      mockAdapter = mockAdapterDefault
      break
  }
  return mockAdapter
}

export default { GET, POST, PATCH, setupMockAxios, resetMockAxios }
