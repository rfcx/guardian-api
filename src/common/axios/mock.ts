import MockAdapter from 'axios-mock-adapter'
import axios from './index'

export const GET = 'GET'
export const POST = 'POST'
export const PATCH = 'PATCH'

const mockAdapter = new MockAdapter(axios)

export function setupMockAxios (request: string, endpoint: string, status: number, mockResponse?: any, headers?: any): MockAdapter | undefined {
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

export function resetMockAxios (): void {
  mockAdapter.reset()
}

export default { GET, POST, PATCH, setupMockAxios, resetMockAxios }
