import MockAdapter from 'axios-mock-adapter'
import axios from './index'

export const GET = 'GET'
export const POST = 'POST'
export const PATCH = 'PATCH'

export function setupMockAxios (request: string, endpoint: string, status: number, mockResponse?: any, headers?: any): MockAdapter | undefined {
  const mockAdapter = new MockAdapter(axios)
  if (request === GET) {
    const mock = mockAdapter.onGet(`/${endpoint}`)
    return mock.reply(status, mockResponse, headers)
  }
  if (request === POST) {
    const mock = mockAdapter.onPost(`/${endpoint}`)
    return mock.reply(status, mockResponse, headers)
  }
  if (request === PATCH) {
    const mock = mockAdapter.onPatch(`/${endpoint}`)
    return mock.reply(status, mockResponse, headers)
  }
}

export default { GET, POST, PATCH, setupMockAxios }
