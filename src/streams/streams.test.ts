import MockDate from 'mockdate'
import routes from './router'
import request from 'supertest'
import Event from '../events/event.model'
import User from '../users/user.model'
import Response from '../responses/models/response.model'
import Classification from '../classifications/classification.model'
import Stream from '../streams/stream.model'

import { migrate, truncate, expressApp, seed, muteConsole, timeout } from '../common/db/testing'
import { sequelize } from '../common/db'
import { GET, setupMockAxios, resetMockAxios } from '../common/axios/mock'
import Incident from '../incidents/incident.model'
jest.mock('../common/auth', () => {
  return {
    getM2MToken: jest.fn(() => 'mocked token')
  }
})
jest.mock('../common/firebase/index', () => {
  return {
    sendToTopic: jest.fn(() => 'sent')
  }
})

let classification: Classification
let user: User

const app = expressApp()

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  classification = await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  await Stream.create({ id: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', lastEventEnd: '2021-06-09T15:38:05.000Z' })
  await Stream.create({ id: 'bbbbbbbbbbbc', projectId: 'cccccccccccc', lastEventEnd: '2021-06-09T15:39:05.000Z' })
  await Stream.create({ id: 'bbbbbbbbbbbd', projectId: 'cccccccccccc', lastEventEnd: '2021-06-09T15:40:05.000Z' })
  await Stream.create({ id: 'bbbbbbbbbbbe', projectId: 'cccccccccccc', lastEventEnd: '2021-06-09T15:41:05.000Z' })
  user = await User.create({ guid: 'user1', email: 'john@doe.com', firstname: 'John', lastname: 'Doe' })
  setupMockAxios('core', GET, 'projects', 200, [{ id: 'cccccccccccc', name: 'test-project-1', isPublic: true, externalId: null }])
})
beforeEach(async () => {
  await truncate([Event, Response, Incident])
})

app.use('/', routes)

const endpoint = 'streams'

describe('GET /streams', () => {
  test('get streams', async () => {
    const mockStream = [
      { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null },
      { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null }
    ]

    setupMockAxios('core', GET, endpoint, 200, mockStream)
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body[0]).toEqual(mockStream[0])
    expect(response.body[1]).toEqual(mockStream[1])
    resetMockAxios()
  })

  test('get empty streams', async () => {
    setupMockAxios('core', GET, endpoint, 200, [])
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([])
    resetMockAxios()
  })

  test('get streams with events count since last report', async () => {
    const mockStream = [
      { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbd', name: 'test-stream-3', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbe', name: 'test-stream-4', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } }
    ]
    const incident = await Incident.create({
      streamId: 'bbbbbbbbbbbb',
      projectId: 'cccccccccccc',
      ref: 1
    })
    await Event.bulkCreate([
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de1', start: '2021-09-15T13:00:00.000Z', end: '2021-09-15T13:05:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-15T13:06:00.123Z' },
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de2', start: '2021-09-15T13:05:00.000Z', end: '2021-09-15T13:10:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-15T13:11:00.123Z' },
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de3', start: '2021-09-15T13:10:00.000Z', end: '2021-09-15T13:15:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-15T13:16:00.123Z' },
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de4', start: '2021-09-15T13:15:00.000Z', end: '2021-09-15T13:20:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-15T13:21:00.123Z' },
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de5', start: '2021-09-15T13:20:00.000Z', end: '2021-09-15T13:25:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-15T13:26:00.123Z' },
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de6', start: '2021-09-15T14:00:00.000Z', end: '2021-09-15T14:05:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbd', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-15T14:06:00.123Z' },
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de7', start: '2021-09-01T14:00:00.000Z', end: '2021-09-01T14:05:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbe', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-01T14:06:00.123Z' },
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de8', start: '2021-09-01T14:10:00.000Z', end: '2021-09-01T14:15:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbe', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-01T14:16:00.123Z' }
    ])
    await Response.bulkCreate([
      { streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', incidentId: incident.id, investigatedAt: '2021-09-15T13:06:00.000Z', startedAt: '2021-09-16T12:21:00.000Z', submittedAt: '2021-09-16T12:26:00.000Z', createdAt: '2021-09-18T13:07:10.000Z', loggingScale: 1, damageScale: 1, createdById: user.id, schemaVersion: 1 },
      { streamId: 'bbbbbbbbbbbc', projectId: 'cccccccccccc', incidentId: incident.id, investigatedAt: '2021-09-11T13:10:00.000Z', startedAt: '2021-09-12T12:27:00.000Z', submittedAt: '2021-09-12T12:28:00.000Z', createdAt: '2021-09-15T13:10:10.000Z', loggingScale: 1, damageScale: 1, createdById: user.id, schemaVersion: 1 },
      { streamId: 'bbbbbbbbbbbd', projectId: 'cccccccccccc', incidentId: incident.id, investigatedAt: '2021-09-15T14:30:00.123Z', startedAt: '2021-09-12T12:31:00.000Z', submittedAt: '2021-09-12T12:33:00.000Z', createdAt: '2021-09-15T14:30:10.000Z', loggingScale: 1, damageScale: 1, createdById: user.id, schemaVersion: 1 }
    ])

    setupMockAxios('core', GET, endpoint, 200, mockStream)
    MockDate.set('2021-09-16T20:10:01.312Z')
    const response = await request(app).get('/').query({ with_events_count: true })
    MockDate.reset()

    expect(response.statusCode).toBe(200)
    const stream1 = response.body[0]
    const stream2 = response.body[1]
    const stream3 = response.body[2]
    const stream4 = response.body[3]
    expect(stream1.id).toEqual(mockStream[0].id)
    expect(stream2.id).toEqual(mockStream[1].id)
    expect(stream3.id).toEqual(mockStream[2].id)
    expect(stream4.id).toEqual(mockStream[3].id)
    expect(stream1.eventsCount).toEqual(3)
    expect(stream2.eventsCount).toEqual(0)
    expect(stream3.eventsCount).toEqual(0)
    expect(stream4.eventsCount).toEqual(0)
    resetMockAxios()
  })

  describe('active query param', () => {
    test('returns 4 active of 5 total streams', async () => {
      const mockStream = [
        { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbd', name: 'test-stream-3', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbe', name: 'test-stream-4', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbf', name: 'test-stream-5', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/').query({ active: true })
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(4)
      resetMockAxios()
    })

    test('returns 4 active of 4 total streams', async () => {
      const mockStream = [
        { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbd', name: 'test-stream-3', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbe', name: 'test-stream-4', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/').query({ active: true })
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(4)
      resetMockAxios()
    })

    test('returns 3 active of 4 total streams', async () => {
      const mockStream = [
        { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbd', name: 'test-stream-3', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/').query({ active: true })
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(3)
      resetMockAxios()
    })

    test('returns 0 active of 4 total streams', async () => {
      const mockStream = [
        { id: 'bbbbbbbbbbbg', name: 'test-stream-6', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbh', name: 'test-stream-7', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbi', name: 'test-stream-8', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
        { id: 'bbbbbbbbbbbj', name: 'test-stream-9', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/').query({ active: true })
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(0)
      resetMockAxios()
    })
  })
})

describe('GET /streams/incidents', () => {
  beforeAll(() => {
    const mockStream = [
      { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbd', name: 'test-stream-3', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbe', name: 'test-stream-4', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbf', name: 'test-stream-5', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } }
    ]
    setupMockAxios('core', GET, endpoint, 200, mockStream)
  })
  beforeEach(async () => {
    // without timeouts these incidents have same createdAt time and then sorted incorrectly
    await Incident.create({ streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', ref: 1 })
    await timeout(1)
    await Incident.create({ streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', ref: 2 })
    await timeout(1)
    await Incident.create({ streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', ref: 3 })
    await timeout(1)
    await Incident.create({ streamId: 'bbbbbbbbbbbc', projectId: 'cccccccccccc', ref: 1 })
    await timeout(1)
    await Incident.create({ streamId: 'bbbbbbbbbbbc', projectId: 'cccccccccccc', ref: 2 })
    await timeout(1)
    await Incident.create({ streamId: 'bbbbbbbbbbbd', projectId: 'cccccccccccc', ref: 1 })
    await timeout(1)
    await Incident.create({ streamId: 'bbbbbbbbbbbe', projectId: 'cccccccccccc', ref: 1 })
  })
  afterAll(() => {
    resetMockAxios()
  })
  test('returns list of active streams', async () => {
    const response = await request(app).get('/incidents')
    expect(response.statusCode).toBe(200)
    const stream1 = response.body[0]
    const stream2 = response.body[1]
    const stream3 = response.body[2]
    const stream4 = response.body[3]
    expect(stream1.id).toBe('bbbbbbbbbbbe')
    expect(stream1.incidents.total).toBe(1)
    expect(stream1.incidents.items.length).toBe(1)
    expect(stream1.incidents.items[0].ref).toBe(1)
    expect(stream2.id).toBe('bbbbbbbbbbbd')
    expect(stream2.incidents.total).toBe(1)
    expect(stream2.incidents.items.length).toBe(1)
    expect(stream2.incidents.items[0].ref).toBe(1)
    expect(stream3.id).toBe('bbbbbbbbbbbc')
    expect(stream3.incidents.total).toBe(2)
    expect(stream3.incidents.items.length).toBe(2)
    expect(stream3.incidents.items[0].ref).toBe(2)
    expect(stream4.id).toBe('bbbbbbbbbbbb')
    expect(stream4.incidents.total).toBe(3)
    expect(stream4.incidents.items.length).toBe(3)
    expect(stream4.incidents.items[0].ref).toBe(3)
  })
  test('returns list of active streams with only one incident', async () => {
    const response = await request(app).get('/incidents').query({ limit_incidents: 1 })
    expect(response.statusCode).toBe(200)
    const stream1 = response.body[0]
    const stream2 = response.body[1]
    const stream3 = response.body[2]
    const stream4 = response.body[3]
    expect(stream1.id).toBe('bbbbbbbbbbbe')
    expect(stream1.incidents.total).toBe(1)
    expect(stream1.incidents.items.length).toBe(1)
    expect(stream1.incidents.items[0].ref).toBe(1)
    expect(stream2.id).toBe('bbbbbbbbbbbd')
    expect(stream2.incidents.total).toBe(1)
    expect(stream2.incidents.items.length).toBe(1)
    expect(stream2.incidents.items[0].ref).toBe(1)
    expect(stream3.id).toBe('bbbbbbbbbbbc')
    expect(stream3.incidents.total).toBe(2)
    expect(stream3.incidents.items.length).toBe(1)
    expect(stream3.incidents.items[0].ref).toBe(2)
    expect(stream4.id).toBe('bbbbbbbbbbbb')
    expect(stream4.incidents.total).toBe(3)
    expect(stream4.incidents.items.length).toBe(1)
    expect(stream4.incidents.items[0].ref).toBe(3)
  })
})
