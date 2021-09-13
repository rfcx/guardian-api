import { GET, setupMockAxios } from '../common/axios/mock'
import { expressApp } from '../common/db/testing/index'
import request from 'supertest'
import routes from './router'

const app = expressApp()

app.use('/', routes)

const endpoint = 'streams'

describe('GET /streams', () => {
  test('get streams', async () => {
    const mockStream = [
      { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null },
      { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null }
    ]

    setupMockAxios(GET, endpoint, 200, mockStream)
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body[0]).toEqual(mockStream[0])
    expect(response.body[1]).toEqual(mockStream[1])
  })

  test('get empty streams', async () => {
    setupMockAxios(GET, endpoint, 200, [])
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([])
  })
})
