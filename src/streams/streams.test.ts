import { startDb, stopDb, truncateDbModels, muteConsole, expressApp } from '../common/db/testing/index'
import { GET, setupMockAxios } from '../common/axios/mock'
import { ClassificationModel, UserModel } from '../types'
import Classification from '../classifications/classification.model'
import Event from '../events/event.model'
import User from '../users/user.model'
import Report from '../reports/report.model'
import request from 'supertest'
import routes from './router'

let classification: ClassificationModel
let user: UserModel

beforeAll(async () => {
  muteConsole()
  await startDb()
  classification = await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  user = await User.create({ guid: 'user1', email: 'john@doe.com', firstname: 'John', lastname: 'Doe' })
})
beforeEach(async () => {
  await truncateDbModels([Event])
})
afterAll(async () => {
  await stopDb()
})

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

  test('get streams with events count since last report', async () => {
    const mockStream = [
      { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null },
      { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null },
      { id: 'bbbbbbbbbbbd', name: 'test-stream-3', isPublic: true, externalId: null },
      { id: 'bbbbbbbbbbbe', name: 'test-stream-4', isPublic: true, externalId: null }
    ]
    await Event.create([
      { externalId: '001', start: '2021-09-15T13:00:00.000Z', end: '2021-09-15T13:05:00.000Z', streamId: 'bbbbbbbbbbbb', classification: classification._id, createdAt: '2021-09-15T13:06:00.123Z' },
      { externalId: '002', start: '2021-09-15T13:05:00.000Z', end: '2021-09-15T13:10:00.000Z', streamId: 'bbbbbbbbbbbb', classification: classification._id, createdAt: '2021-09-15T13:11:00.123Z' },
      { externalId: '003', start: '2021-09-15T13:10:00.000Z', end: '2021-09-15T13:15:00.000Z', streamId: 'bbbbbbbbbbbb', classification: classification._id, createdAt: '2021-09-15T13:16:00.123Z' },
      { externalId: '004', start: '2021-09-15T13:15:00.000Z', end: '2021-09-15T13:20:00.000Z', streamId: 'bbbbbbbbbbbb', classification: classification._id, createdAt: '2021-09-15T13:21:00.123Z' },
      { externalId: '005', start: '2021-09-15T13:20:00.000Z', end: '2021-09-15T13:25:00.000Z', streamId: 'bbbbbbbbbbbb', classification: classification._id, createdAt: '2021-09-15T13:26:00.123Z' },
      { externalId: '006', start: '2021-09-15T14:00:00.000Z', end: '2021-09-15T14:05:00.000Z', streamId: 'bbbbbbbbbbbd', classification: classification._id, createdAt: '2021-09-15T14:06:00.123Z' }
    ])
    await Report.create([
      { guardianId: 'bbbbbbbbbbbb', encounteredAt: '2021-09-11T13:05:00.000Z', createdAt: '2021-09-15T13:07:10.000Z', updatedAt: '2021-09-16T11:00:00.000Z', isLoggerEncountered: true, isEvidenceEncountered: false, loggingScale: 1, user: user._id, schemaVersion: 1 },
      { guardianId: 'bbbbbbbbbbbc', encounteredAt: '2021-09-11T13:10:00.000Z', createdAt: '2021-09-15T13:10:10.000Z', updatedAt: '2021-09-15T13:10:10.000Z', isLoggerEncountered: true, isEvidenceEncountered: false, loggingScale: 1, user: user._id, schemaVersion: 1 },
      { guardianId: 'bbbbbbbbbbbd', encounteredAt: '2021-09-15T14:30:00.123Z', createdAt: '2021-09-15T14:30:10.000Z', updatedAt: '2021-09-15T14:30:10.000Z', isLoggerEncountered: true, isEvidenceEncountered: false, loggingScale: 1, user: user._id, schemaVersion: 1 }
    ])

    setupMockAxios(GET, endpoint, 200, mockStream)
    const response = await request(app).get('/').query({ with_events_count: true })

    expect(response.statusCode).toBe(200)
    const stream1 = response.body[0]
    const stream2 = response.body[1]
    const stream3 = response.body[2]
    const stream4 = response.body[3]
    expect(stream1.id).toEqual(mockStream[0].id)
    expect(stream2.id).toEqual(mockStream[1].id)
    expect(stream3.id).toEqual(mockStream[2].id)
    expect(stream4.id).toEqual(mockStream[3].id)
    expect(stream1.eventsCount).toEqual(4)
    expect(stream2.eventsCount).toEqual(0)
    expect(stream3.eventsCount).toEqual(0)
    expect(stream4.eventsCount).toEqual(0)
  })
})
