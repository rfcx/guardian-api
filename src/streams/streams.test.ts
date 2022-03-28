import MockDate from 'mockdate'
import routes from './router'
import request from 'supertest'
import Event from '../events/event.model'
import Response from '../responses/models/response.model'
import Classification from '../classifications/classification.model'
import Stream from './models/stream.model'

import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
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

const app = expressApp()

const STREAM1 = 'bbbbbbbbbbbb'
const STREAM2 = 'bbbbbbbbbbbc'
const STREAM3 = 'bbbbbbbbbbbd'
const STREAM4 = 'bbbbbbbbbbbe'
const STREAM5 = 'bbbbbbbbbbbf'
const PROJECT1 = 'cccccccccccc'

const STREAM1_LAST_EV_END = '2021-08-30T10:32:00.000Z'
const STREAM2_LAST_EV_END = '2021-08-30T10:38:00.000Z'
const STREAM3_LAST_EV_END = '2021-08-30T10:41:00.000Z'
const STREAM4_LAST_EV_END = '2021-08-30T10:44:00.000Z'
const STREAM5_LAST_EV_END = '2021-08-30T10:46:00.000Z'

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  classification = await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  await Stream.create({ id: STREAM1, projectId: PROJECT1, lastEventEnd: STREAM1_LAST_EV_END, hasOpenIncident: true })
  await Stream.create({ id: STREAM2, projectId: PROJECT1, lastEventEnd: STREAM2_LAST_EV_END, hasOpenIncident: true })
  await Stream.create({ id: STREAM3, projectId: PROJECT1, lastEventEnd: STREAM3_LAST_EV_END, hasOpenIncident: true })
  await Stream.create({ id: STREAM4, projectId: PROJECT1, lastEventEnd: STREAM4_LAST_EV_END, hasOpenIncident: true })
  await Stream.create({ id: STREAM5, projectId: PROJECT1, lastEventEnd: STREAM5_LAST_EV_END })
  setupMockAxios('core', GET, 'projects', 200, [{ id: PROJECT1, name: 'test-project-1', isPublic: true, externalId: null }])
  setupMockAxios('core', GET, `streams/${STREAM1}`, 200, { id: STREAM1, name: 'test-stream-1' })
  setupMockAxios('core', GET, `v2/streams/${STREAM1}`, 200, { type: 'satellite' })
  setupMockAxios('core', GET, `v2/streams/${STREAM2}`, 200, { type: 'gsm' })
  setupMockAxios('core', GET, `v2/streams/${STREAM3}`, 404, undefined)
  setupMockAxios('core', GET, `v2/streams/${STREAM4}`, 200, { type: 'edge' })
  setupMockAxios('core', GET, `v2/streams/${STREAM5}`, 404, undefined)
})
beforeEach(async () => {
  await truncate([Event, Response, Incident])
})

app.use('/', routes)

const endpoint = 'streams'

describe('GET /streams/:id', () => {
  test('get streams', async () => {
    const response = await request(app).get(`/${STREAM1}`)
    expect(response.statusCode).toBe(200)
    const stream = response.body
    expect(stream.id).toEqual(STREAM1)
    expect(stream.name).toEqual('test-stream-1')
    expect(stream.guardianType).toEqual('satellite')
  })
})

describe('GET /streams', () => {
  test('get streams', async () => {
    const mockStream = [
      { id: STREAM2, name: 'test-stream-2', isPublic: true, externalId: null },
      { id: STREAM1, name: 'test-stream-1', isPublic: true, externalId: null }
    ]

    setupMockAxios('core', GET, endpoint, 200, mockStream)
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    const stream2 = response.body[0]
    const stream1 = response.body[1]
    expect(stream2.id).toEqual(mockStream[0].id)
    expect(stream1.id).toEqual(mockStream[1].id)
    resetMockAxios()
  })

  test('get empty streams', async () => {
    setupMockAxios('core', GET, endpoint, 200, [])
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([])
    resetMockAxios()
  })

  describe('check type parameter into the query parameters', () => {

    test('get streams with type guardian', async () => {
      const mockStream = [
        { id: STREAM1, name: 'test-stream-1', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM2, name: 'test-stream-2', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM3, name: 'test-stream-3', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM4, name: 'test-stream-4', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM5, name: 'test-stream-5', isPublic: true, externalId: null, project: { id: PROJECT1 } }
      ]
  
      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/').query({ type: 'guardian' })
      expect(response.statusCode).toBe(200)
      console.log(response.body)
      expect(response.body.length).toBe(2)
      expect(response.body[0].guardianType).toBe('gsm')
      expect(response.body[1].guardianType).toBe('satellite')
      resetMockAxios()
    })

    test('get streams with type stream', async () => {
      const mockStream = [
        { id: STREAM1, name: 'test-stream-1', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM2, name: 'test-stream-2', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM3, name: 'test-stream-3', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM4, name: 'test-stream-4', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM5, name: 'test-stream-5', isPublic: true, externalId: null, project: { id: PROJECT1 } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/').query({ type: 'stream' })
      console.log(response.body)
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(2)
      expect(response.body[0].guardianType).toBe('edge')
      expect(response.body[1].guardianType).toBe(null)
      resetMockAxios()
    })

  })



  describe('active query param', () => {
    test('returns 4 active of 5 total streams', async () => {
      const mockStream = [
        { id: STREAM1, name: 'test-stream-1', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM2, name: 'test-stream-2', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM3, name: 'test-stream-3', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM4, name: 'test-stream-4', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM5, name: 'test-stream-5', isPublic: true, externalId: null, project: { id: PROJECT1 } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/')
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(4)
      expect(response.body[0].guardianType).toBe('edge')
      expect(response.body[1].guardianType).toBe(null)
      expect(response.body[2].guardianType).toBe('gsm')
      expect(response.body[3].guardianType).toBe('satellite')
      resetMockAxios()
    })

    test('returns 4 active of 4 total streams', async () => {
      const mockStream = [
        { id: STREAM1, name: 'test-stream-1', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM2, name: 'test-stream-2', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM3, name: 'test-stream-3', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM4, name: 'test-stream-4', isPublic: true, externalId: null, project: { id: PROJECT1 } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/')
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(4)
      resetMockAxios()
    })

    test('returns 3 active of 4 total streams', async () => {
      const mockStream = [
        { id: STREAM1, name: 'test-stream-1', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM2, name: 'test-stream-2', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM3, name: 'test-stream-3', isPublic: true, externalId: null, project: { id: PROJECT1 } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/')
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(3)
      resetMockAxios()
    })

    test('returns 0 active of 4 total streams', async () => {
      const mockStream = [
        { id: 'bbbbbbbbbbbg', name: 'test-stream-6', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: 'bbbbbbbbbbbh', name: 'test-stream-7', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: 'bbbbbbbbbbbi', name: 'test-stream-8', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: 'bbbbbbbbbbbj', name: 'test-stream-9', isPublic: true, externalId: null, project: { id: PROJECT1 } }
      ]

      setupMockAxios('core', GET, endpoint, 200, mockStream)
      const response = await request(app).get('/')
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(0)
      resetMockAxios()
    })
  })
  describe('querying based on stats', () => {
    let incident1
    beforeAll(() => {
      const mockStream = [
        { id: STREAM1, name: 'test-stream-1', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM2, name: 'test-stream-2', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM3, name: 'test-stream-3', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM4, name: 'test-stream-4', isPublic: true, externalId: null, project: { id: PROJECT1 } },
        { id: STREAM5, name: 'test-stream-5', isPublic: true, externalId: null, project: { id: PROJECT1 } }
      ]
      setupMockAxios('core', GET, endpoint, 200, mockStream)
    })
    beforeEach(async () => {
      incident1 = await Incident.create({ streamId: STREAM1, projectId: PROJECT1, ref: 1, closedAt: '2021-08-15T11:23:01.000Z' })
      const event1 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11', start: '2021-08-14T10:00:00.000Z', end: '2021-08-14T10:02:00.000Z', createdAt: '2021-08-14T10:02:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident1.id })
      await incident1.update({ firstEventId: event1.id })
      const incident2 = await Incident.create({ streamId: STREAM1, projectId: PROJECT1, ref: 2 })
      const event2 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12', start: '2021-08-14T10:03:00.000Z', end: '2021-08-14T10:05:00.000Z', createdAt: '2021-08-14T10:05:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident2.id })
      await incident2.update({ firstEventId: event2.id })
      const incident3 = await Incident.create({ streamId: STREAM1, projectId: PROJECT1, ref: 3 })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b13', start: '2021-08-14T10:06:00.000Z', end: '2021-08-14T10:08:00.000Z', createdAt: '2021-08-14T10:08:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b14', start: '2021-08-14T10:09:00.000Z', end: '2021-08-14T10:11:00.000Z', createdAt: '2021-08-14T10:11:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b15', start: '2021-08-14T10:12:00.000Z', end: '2021-08-14T10:14:00.000Z', createdAt: '2021-08-14T10:14:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b16', start: '2021-08-14T10:15:00.000Z', end: '2021-08-14T10:17:00.000Z', createdAt: '2021-08-17T10:17:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b17', start: '2021-08-14T10:18:00.000Z', end: '2021-08-14T10:20:00.000Z', createdAt: '2021-08-17T10:20:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b18', start: '2021-08-14T10:21:00.000Z', end: '2021-08-14T10:23:00.000Z', createdAt: '2021-08-17T10:23:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b19', start: '2021-08-14T10:24:00.000Z', end: '2021-08-14T10:26:00.000Z', createdAt: '2021-08-17T10:26:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b20', start: '2021-08-14T10:27:00.000Z', end: '2021-08-14T10:29:00.000Z', createdAt: '2021-08-17T10:29:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b21', start: '2021-08-14T10:30:00.000Z', end: '2021-08-14T10:32:00.000Z', createdAt: '2021-08-17T10:32:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b22', start: '2021-08-22T10:30:00.000Z', end: '2021-08-22T10:32:00.000Z', createdAt: '2021-08-22T10:32:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      const event3 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b23', start: '2021-08-30T10:30:00.000Z', end: STREAM1_LAST_EV_END, createdAt: '2021-08-30T10:32:01.000Z', streamId: STREAM1, projectId: PROJECT1, classificationId: classification.id, incidentId: incident3.id })
      await incident3.update({ firstEventId: event3.id })
      await Stream.update({ lastEventEnd: STREAM1_LAST_EV_END, lastIncidentEventsCount: 11 }, { where: { id: STREAM1 } })
      const incident4 = await Incident.create({ streamId: STREAM2, projectId: PROJECT1, ref: 4 })
      const event4 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b24', start: '2021-08-30T10:33:00.000Z', end: '2021-08-30T10:35:00.000Z', createdAt: '2021-08-30T10:35:01.000Z', streamId: STREAM2, projectId: PROJECT1, classificationId: classification.id, incidentId: incident4.id })
      await incident4.update({ firstEventId: event4.id })
      const incident5 = await Incident.create({ streamId: STREAM2, projectId: PROJECT1, ref: 5 })
      const event5 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b25', start: '2021-08-30T10:36:00.000Z', end: STREAM2_LAST_EV_END, createdAt: '2021-08-30T10:38:01.000Z', streamId: STREAM2, projectId: PROJECT1, classificationId: classification.id, incidentId: incident5.id })
      await incident5.update({ firstEventId: event5.id })
      await Stream.update({ lastEventEnd: STREAM2_LAST_EV_END, lastIncidentEventsCount: 1 }, { where: { id: STREAM2 } })
      const incident6 = await Incident.create({ streamId: STREAM3, projectId: PROJECT1, ref: 6 })
      const event6 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b26', start: '2021-08-30T10:39:00.000Z', end: STREAM3_LAST_EV_END, createdAt: '2021-08-30T10:41:01.000Z', streamId: STREAM3, projectId: PROJECT1, classificationId: classification.id, incidentId: incident6.id })
      await incident6.update({ firstEventId: event6.id })
      await Stream.update({ lastEventEnd: STREAM3_LAST_EV_END, lastIncidentEventsCount: 1 }, { where: { id: STREAM3 } })
      const incident7 = await Incident.create({ streamId: STREAM4, projectId: PROJECT1, ref: 7 })
      const event7 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b27', start: '2021-08-30T10:42:00.000Z', end: STREAM4_LAST_EV_END, createdAt: '2021-08-30T10:44:01.000Z', streamId: STREAM4, projectId: PROJECT1, classificationId: classification.id, incidentId: incident7.id })
      await incident7.update({ firstEventId: event7.id })
      await Stream.update({ lastEventEnd: STREAM4_LAST_EV_END, lastIncidentEventsCount: 1 }, { where: { id: STREAM4 } })
      const incident8 = await Incident.create({ streamId: STREAM5, projectId: PROJECT1, ref: 8, closedAt: '2021-08-30T12:21:01.000Z' })
      const event8 = await Event.create({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b28', start: '2021-08-30T10:44:00.000Z', end: STREAM5_LAST_EV_END, createdAt: '2021-08-30T10:46:01.000Z', streamId: STREAM4, projectId: PROJECT1, classificationId: classification.id, incidentId: incident8.id })
      await incident7.update({ firstEventId: event8.id })
      await Stream.update({ lastEventEnd: STREAM5_LAST_EV_END, lastIncidentEventsCount: 1 }, { where: { id: STREAM5 } })
    })
    afterAll(() => {
      resetMockAxios()
    })
    test('returns list of active streams', async () => {
      const response = await request(app).get('/').query({ limit_incidents: 10 })
      expect(response.statusCode).toBe(200)
      const stream1 = response.body[0]
      const stream2 = response.body[1]
      const stream3 = response.body[2]
      const stream4 = response.body[3]
      expect(stream1.id).toBe(STREAM4)
      expect(stream1.incidents.total).toBe(1)
      expect(stream1.incidents.items.length).toBe(1)
      expect(stream2.id).toBe(STREAM3)
      expect(stream2.incidents.total).toBe(1)
      expect(stream2.incidents.items.length).toBe(1)
      expect(stream3.id).toBe(STREAM2)
      expect(stream3.incidents.total).toBe(2)
      expect(stream3.incidents.items.length).toBe(2)
      expect(stream4.id).toBe(STREAM1)
      expect(stream4.incidents.total).toBe(2)
      expect(stream4.incidents.items.length).toBe(2)
    })
    test('returns list of active streams with only one incident', async () => {
      const response = await request(app).get('/').query({ limit_incidents: 1 })
      expect(response.statusCode).toBe(200)
      const stream1 = response.body[0]
      const stream2 = response.body[1]
      const stream3 = response.body[2]
      const stream4 = response.body[3]
      expect(stream1.id).toBe(STREAM4)
      expect(stream1.incidents.total).toBe(1)
      expect(stream1.incidents.items.length).toBe(1)
      expect(stream2.id).toBe(STREAM3)
      expect(stream2.incidents.total).toBe(1)
      expect(stream2.incidents.items.length).toBe(1)
      expect(stream3.id).toBe(STREAM2)
      expect(stream3.incidents.total).toBe(2)
      expect(stream3.incidents.items.length).toBe(1)
      expect(stream4.id).toBe(STREAM1)
      expect(stream4.incidents.total).toBe(2)
      expect(stream4.incidents.items.length).toBe(1)
    })
    test('returns list of active streams including closed incidents', async () => {
      const response = await request(app).get('/').query({ limit_incidents: 10, include_closed_incidents: true })
      const stream5 = response.body[0]
      const stream1 = response.body[4]
      expect(stream1.incidents.total).toBe(3)
      expect(stream1.incidents.items.length).toBe(3)
      expect(stream5.incidents.total).toBe(1)
      expect(stream5.incidents.items.length).toBe(1)
    })
    test('returns list of streams without incidents if "limit_incidents" is not set', async () => {
      const response = await request(app).get('/')
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(4)
      expect(response.body[0].incidents).toBeUndefined()
      expect(response.body[1].incidents).toBeUndefined()
      expect(response.body[2].incidents).toBeUndefined()
      expect(response.body[3].incidents).toBeUndefined()
      expect(response.body[0].tags.includes('open')).toBeTruthy()
      expect(response.body[1].tags.includes('open')).toBeTruthy()
      expect(response.body[2].tags.includes('open')).toBeTruthy()
      expect(response.body[3].tags.includes('hot')).toBeTruthy()
      expect(response.body[3].tags.includes('open')).toBeTruthy()
    })
    test('returns list of streams with hot incident', async () => {
      const response = await request(app).get('/').query({ has_hot_incident: true })
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(1)
      expect(response.body[0].id).toBe(STREAM1)
      expect(response.body[0].tags.includes('hot')).toBeTruthy()
    })
    test('returns list of streams which have new events', async () => {
      MockDate.set('2021-08-30T16:40:00.000Z')
      const response = await request(app).get('/').query({ has_new_events: true })
      MockDate.reset()
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(2)
      expect(response.body[0].id).toBe(STREAM4)
      expect(response.body[1].id).toBe(STREAM3)
      expect(response.body[0].tags.includes('recent')).toBeTruthy()
      expect(response.body[1].tags.includes('recent')).toBeTruthy()
    })
  })
  describe('params validation', () => {
    test('throws validation error if "projects" single item is not matching reg exp', async () => {
      const response = await request(app).get('/').query({ projects: 'undefined' })
      expect(response.statusCode).toBe(400)
      expect(response.body.message).toBe('Validation errors: Parameter \'projects\' should consist of 12 lower-cased characters or digits.')
    })
    test('throws validation error if "projects" array with single item is not matching reg exp', async () => {
      const response = await request(app).get('/').query({ projects: ['undefined'] })
      expect(response.statusCode).toBe(400)
      expect(response.body.message).toBe('Validation errors: Parameter \'projects\' should consist of 12 lower-cased characters or digits.')
    })
    test('throws validation error if one of array item of "projects" array is not matching reg exp', async () => {
      const response = await request(app).get('/').query({ projects: ['s1ff1g4tgash', 'AAbbbbgfvrq2'] })
      expect(response.statusCode).toBe(400)
      expect(response.body.message).toBe('Validation errors: Parameter \'projects\' should consist of 12 lower-cased characters or digits.')
    })
  })
})
