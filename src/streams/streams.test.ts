import routes from './router'
import request from 'supertest'
import Event from '../events/event.model'
import User from '../users/user.model'
import Response from '../responses/models/response.model'
import Classification from '../classifications/classification.model'

import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
import { sequelize } from '../common/db'
import { GET, setupMockAxios } from '../common/axios/mock'
import Incident from '../incidents/incident.model'

let classification: Classification
let user: User

const app = expressApp()

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  classification = await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  user = await User.create({ guid: 'user1', email: 'john@doe.com', firstname: 'John', lastname: 'Doe' })
})
beforeEach(async () => {
  await truncate([Event])
})

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
      { id: 'bbbbbbbbbbbb', name: 'test-stream-1', isPublic: true, externalId: null, project: { id: 'cccccccccccc' } },
      { id: 'bbbbbbbbbbbc', name: 'test-stream-2', isPublic: true, externalId: null, project: { id: 'cccccccccccd' } },
      { id: 'bbbbbbbbbbbd', name: 'test-stream-3', isPublic: true, externalId: null, project: { id: 'ccccccccccce' } },
      { id: 'bbbbbbbbbbbe', name: 'test-stream-4', isPublic: true, externalId: null, project: { id: 'cccccccccccf' } }
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
      { id: '9c5acb84-78fc-4bb5-88af-1710f9a64de6', start: '2021-09-15T14:00:00.000Z', end: '2021-09-15T14:05:00.000Z', incidentId: incident.id, streamId: 'bbbbbbbbbbbd', projectId: 'cccccccccccc', classificationId: classification.id, createdAt: '2021-09-15T14:06:00.123Z' }
    ])
    await Response.bulkCreate([
      { streamId: 'bbbbbbbbbbbb', projectId: 'cccccccccccc', incidentId: incident.id, investigatedAt: '2021-09-11T13:05:00.000Z', startedAt: '2021-09-12T12:21:00.000Z', submittedAt: '2021-09-12T12:26:00.000Z', createdAt: '2021-09-15T13:07:10.000Z', loggingScale: 1, damageScale: 1, createdById: user.id, schemaVersion: 1 },
      { streamId: 'bbbbbbbbbbbc', projectId: 'cccccccccccc', incidentId: incident.id, investigatedAt: '2021-09-11T13:10:00.000Z', startedAt: '2021-09-12T12:27:00.000Z', submittedAt: '2021-09-12T12:28:00.000Z', createdAt: '2021-09-15T13:10:10.000Z', loggingScale: 1, damageScale: 1, createdById: user.id, schemaVersion: 1 },
      { streamId: 'bbbbbbbbbbbd', projectId: 'cccccccccccc', incidentId: incident.id, investigatedAt: '2021-09-15T14:30:00.123Z', startedAt: '2021-09-12T12:31:00.000Z', submittedAt: '2021-09-12T12:33:00.000Z', createdAt: '2021-09-15T14:30:10.000Z', loggingScale: 1, damageScale: 1, createdById: user.id, schemaVersion: 1 }
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
