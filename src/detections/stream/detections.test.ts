import routes from './router'
import request from 'supertest'
import Event from '../../events/event.model'
// import User from '../../users/user.model'
// import Response from '../../responses/models/response.model'
// import Classification from '../../classifications/classification.model'

import { migrate, truncate, expressApp, seed, muteConsole } from '../../common/db/testing'
import { sequelize } from '../../common/db'
import { GET, setupMockAxios, resetMockAxios } from '../../common/axios/mock'
// import Incident from '../../incidents/incident.model'
jest.mock('../../common/auth', () => {
  return {
    getM2MToken: jest.fn(() => 'mocked token')
  }
})
jest.mock('../../common/firebase/index', () => {
  return {
    sendToTopic: jest.fn(() => 'sent')
  }
})

const app = expressApp()

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
})
beforeEach(async () => {
  await truncate([Event])
})

app.use('/', routes)

const endpoint = 'streams/abc/detections'

describe('GET /streams', () => {
  test('get detections', async () => {
    const mockDetections = [
      {
        streamId: '43osjykdldr6',
        start: '2021-11-30T03:45:38.361Z',
        end: '2021-11-30T03:45:39.321Z',
        confidence: 0.960682213306427,
        classification: {
          value: 'vehicle',
          title: 'Vehicle'
        }
      },
      {
        streamId: '43osjykdldr6',
        start: '2021-11-30T03:45:58.041Z',
        end: '2021-11-30T03:45:59.001Z',
        confidence: 0.984252154827118,
        classification: {
          value: 'vehicle',
          title: 'Vehicle'
        }
      }
    ]

    setupMockAxios('core', GET, endpoint, 200, mockDetections)
    const response = await request(app).get('/abc/detections').query({ start: '2021-11-30T03:45:38.361Z', end: '2021-11-30T03:45:59.001Z' })

    expect(response.statusCode).toBe(200)
    expect(response.body[0]).toEqual(mockDetections[0])
    expect(response.body[1]).toEqual(mockDetections[1])
    resetMockAxios()
  })

  test('get empty detections list', async () => {
    setupMockAxios('core', GET, endpoint, 200, [])
    const response = await request(app).get('/abc/detections').query({ start: '2021-11-30T03:45:58.041Z', end: '2021-11-30T03:47:58.041Z' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([])
    resetMockAxios()
  })

  test('returns 400 if start query param is not defined', async () => {
    setupMockAxios('core', GET, endpoint, 200, [])
    const response = await request(app).get('/abc/detections').query({ end: '2021-11-30T03:47:58.041Z' })

    expect(response.statusCode).toBe(400)
    resetMockAxios()
  })

  test('returns 400 if end query param is not defined', async () => {
    setupMockAxios('core', GET, endpoint, 200, [])
    const response = await request(app).get('/abc/detections').query({ start: '2021-11-30T03:45:58.041Z' })

    expect(response.statusCode).toBe(400)
    resetMockAxios()
  })
})
