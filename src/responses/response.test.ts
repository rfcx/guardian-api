import MockDate from 'mockdate'
import routes from './router'
import { migrate, truncate, expressApp, seed, muteConsole, seedValues } from '../common/db/testing'
import { GET, setupMockAxios, resetMockAxios } from '../common/axios/mock'
import request from 'supertest'
import { sequelize } from '../common/db'
import Response from './models/response.model'
import Incident, { incidentAttributes } from '../incidents/incident.model'
import Event from '../events/event.model'
import Asset from '../assets/asset.model'
import { list } from './dao'
import incidentsDao from '../incidents/dao'
import Classification from '../classifications/classification.model'
import service from './service'
import ResponseAnswer from './models/response-answer.model'
import Stream from '../streams/models/stream.model'
const app = expressApp()
jest.mock('../common/auth', () => {
  return {
    getM2MToken: jest.fn(() => 'mocked token')
  }
})

app.use('/', routes)

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  setupMockAxios('core', GET, 'streams/aaaaaaaaa000', 200, { project: { id: 'project000001' } })
  await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  await Stream.create({ id: 'aaaaaaaaa000', projectId: 'project000001', lastEventEnd: '2021-06-09T15:38:05.000Z' })
  await Stream.create({ id: 'aaaaaaaaa001', projectId: 'project000002', lastEventEnd: '2021-06-09T15:39:05.000Z' })
  await Stream.create({ id: 'stream000000', projectId: 'project000000', lastEventEnd: '2021-06-09T15:40:05.000Z' })
  jest.spyOn(service, 'uploadFileAndSaveToDb').mockImplementation(async () => await Promise.resolve(''))
})
beforeEach(async () => {
  await truncate([Asset, Response, Event, Incident])
})
afterAll(() => {
  resetMockAxios()
})

describe('POST /responses', () => {
  describe('validation', () => {
    test('returns 400 if investigatedAt is not defined', async () => {
      const requestBody = {
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        answers: [102, 104, 105, 201, 301, 401],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if startedAt is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-05-03T12:31:42.150Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        answers: [102, 104, 105, 201, 301, 401],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if submittedAt is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-05-03T12:31:42.150Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        answers: [102, 104, 105, 201, 301, 401],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('creates response if note is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-05-03T12:31:42.150Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        answers: [102, 104, 105, 201, 301, 401],
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(201)
      const responses: Response[] = await list()
      const response = responses[0]
      expect(responses.length).toBe(1)
      expect(response.investigatedAt?.toISOString()).toBe('2021-05-03T12:31:42.150Z')
      expect(response.answers?.length).toBe(6)
      expect(response.answers?.map(e => e.id).includes(102)).toBeTruthy()
      expect(response.answers?.map(e => e.id).includes(104)).toBeTruthy()
      expect(response.answers?.map(e => e.id).includes(105)).toBeTruthy()
      expect(response.answers?.map(e => e.id).includes(201)).toBeTruthy()
      expect(response.answers?.map(e => e.id).includes(301)).toBeTruthy()
      expect(response.answers?.map(e => e.id).includes(401)).toBeTruthy()
      expect(response.streamId).toBe('aaaaaaaaa000')
    })
    test('returns 400 if streamId is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        answers: [102, 104, 105, 201, 301, 401],
        note: 'Test note'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if streamId has invalid format', async () => {
      const requestBody = {
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        answers: [102, 104, 105, 201, 301, 401],
        note: 'Test note',
        streamId: 'Aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
      expect(reqResponse.body.message).toBe('Validation errors: Parameter \'streamId\' should consist of 12 lower-cased characters or digits.')
    })
  })
  test('creates response and one incident', async () => {
    const requestBody = {
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      answers: [101, 103, 201, 204, 301, 402],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list()
    const response = responses[0]
    expect(responses.length).toBe(1)
    expect(response.investigatedAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(response.startedAt?.toISOString()).toBe('2021-06-09T15:35:21.000Z')
    expect(response.submittedAt?.toISOString()).toBe('2021-06-09T15:38:05.000Z')
    expect(response.answers?.map(e => e.id).includes(101)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(103)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(201)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(204)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(301)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(402)).toBeTruthy()
    expect(response.streamId).toBe('aaaaaaaaa000')
    expect(response.projectId).toBe('project000001')
    const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'firstResponse'] })
    expect(incidents.length).toBe(1)
    expect(incidents[0].streamId).toBe('aaaaaaaaa000')
    expect(incidents[0].projectId).toBe('project000001')
    expect(incidents[0].firstResponse.id).toBe(response.id)
  })
  test('creates two responses for one incident', async () => {
    const response1 = await request(app).post('/').send({
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-08T19:30:02.000Z',
      submittedAt: '2021-06-08T19:32:06.000Z',
      answers: [101, 103, 202, 203, 301, 402],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    })
    const response2 = await request(app).post('/').send({
      investigatedAt: '2021-06-08T19:51:40.000Z',
      startedAt: '2021-06-08T19:55:02.000Z',
      submittedAt: '2021-06-08T19:57:06.000Z',
      answers: [100, 200, 302, 403],
      streamId: 'aaaaaaaaa000'
    })
    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'investigatedAt', dir: 'ASC' } })
    expect(responses.length).toBe(2)
    expect(responses[0].investigatedAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(responses[1].investigatedAt?.toISOString()).toBe('2021-06-08T19:51:40.000Z')
    const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'firstResponse'] })
    expect(incidents.length).toBe(1)
    expect(incidents[0].streamId).toBe('aaaaaaaaa000')
    expect(incidents[0].projectId).toBe('project000001')
    expect(incidents[0].firstResponse.id).toBe(responses[0].id)
    expect(responses[0].incident.id).toBe(incidents[0].id)
    expect(responses[1].incident.id).toBe(incidents[0].id)
  })
  test('creates two responses and two incidents', async () => {
    const response1 = await request(app).post('/').send({
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-08T19:30:02.000Z',
      submittedAt: '2021-06-08T19:32:06.000Z',
      answers: [101, 103, 202, 203, 301, 402],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    })
    const response2 = await request(app).post('/').send({
      investigatedAt: '2021-06-10T19:51:40.000Z',
      startedAt: '2021-06-10T19:55:02.000Z',
      submittedAt: '2021-06-10T19:57:06.000Z',
      answers: [101, 103, 202, 203, 301, 402],
      streamId: 'aaaaaaaaa000'
    })
    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'investigatedAt', dir: 'ASC' } })
    expect(responses.length).toBe(2)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' }, fields: [...incidentAttributes.full, 'firstResponse'] })
    expect(incidents.length).toBe(2)
    expect(incidents[0].firstResponse.id).toBe(responses[0].id)
    expect(incidents[1].firstResponse.id).toBe(responses[1].id)
    expect(responses[0].incident.id).toBe(incidents[0].id)
    expect(responses[1].incident.id).toBe(incidents[1].id)
  })
  test('creates response and another incident if previous is outdated by event', async () => {
    MockDate.set('2021-06-14T20:10:01.312Z')
    const incident = await Incident.create({
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      ref: 1
    })
    const event = await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
      start: '2021-06-01T20:05:01.312Z',
      end: '2021-06-01T20:07:01.312Z',
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-06-01T20:10:01.312Z',
      incidentId: incident.id
    })
    await incident.update({ firstEventId: event.id })
    const requestBody = {
      investigatedAt: '2021-06-09T19:26:40.000Z',
      startedAt: '2021-06-10T15:35:21.000Z',
      submittedAt: '2021-06-10T15:38:05.000Z',
      answers: [101, 103, 202, 203, 301, 402],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    MockDate.reset()
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    expect(responses.length).toBe(1)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' }, fields: [...incidentAttributes.full, 'firstResponse'] })
    expect(incidents.length).toBe(2)
    expect(incidents[1].streamId).toBe('aaaaaaaaa000')
    expect(incidents[1].projectId).toBe('project000001')
    expect(incidents[1].firstResponse.id).toBe(responses[0].id)
    expect(incidents[1].ref).toBe(2)
  })
  test('creates response and assigns it to existing incident if previous event is in last 7 days', async () => {
    MockDate.set('2021-06-01T20:12:01.312Z')
    const incident = await Incident.create({
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      ref: 1
    })
    const event = await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
      start: '2021-06-01T20:05:01.312Z',
      end: '2021-06-01T20:07:01.312Z',
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-06-01T20:10:01.312Z',
      incidentId: incident.id
    })
    await incident.update({ firstEventId: event.id })
    const requestBody = {
      investigatedAt: '2021-06-05T20:10:01.312Z',
      startedAt: '2021-06-05T21:10:01.312Z',
      submittedAt: '2021-06-05T21:12:01.312Z',
      answers: [101, 103, 202, 203, 301, 402],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    MockDate.reset()
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    expect(responses.length).toBe(1)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' }, fields: [...incidentAttributes.full, 'firstResponseId', 'firstResponse'] })
    expect(incidents.length).toBe(1)
    expect(incidents[0].streamId).toBe('aaaaaaaaa000')
    expect(incidents[0].projectId).toBe('project000001')
    expect(incidents[0].firstResponse.id).toBe(responses[0].id)
  })
  test('creates response and another incident if existing incident relates to another project', async () => {
    MockDate.set('2021-06-14T20:10:01.312Z')
    const incident = await Incident.create({
      streamId: 'aaaaaaaaa001',
      projectId: 'project000002',
      ref: 1
    })
    const event = await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
      start: '2021-06-01T20:05:01.312Z',
      end: '2021-06-01T20:07:01.312Z',
      streamId: 'aaaaaaaaa001',
      projectId: 'project000002',
      classificationId: 1,
      createdAt: '2021-06-01T20:10:01.312Z',
      incidentId: incident.id
    })
    await incident.update({ firstEventId: event.id })
    const requestBody = {
      investigatedAt: '2021-06-09T19:26:40.000Z',
      startedAt: '2021-06-10T15:35:21.000Z',
      submittedAt: '2021-06-10T15:38:05.000Z',
      answers: [101, 103, 202, 203, 301, 402],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    MockDate.reset()
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    expect(responses.length).toBe(1)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' }, fields: [...incidentAttributes.full, 'firstResponse'] })
    expect(incidents.length).toBe(2)
    expect(incidents[1].streamId).toBe('aaaaaaaaa000')
    expect(incidents[1].projectId).toBe('project000001')
    expect(incidents[1].firstResponse.id).toBe(responses[0].id)
    expect(incidents[1].ref).toBe(1)
  })
  test('moves events to a new incident if response is created too late', async () => {
    MockDate.set('2021-06-14T20:10:01.312Z')
    const incident = await Incident.create({
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      ref: 1
    })
    const event = await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
      start: '2021-06-01T20:05:01.312Z',
      end: '2021-06-01T20:07:01.312Z',
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-06-01T20:10:01.312Z',
      incidentId: incident.id
    })
    await incident.update({ firstEventId: event.id })
    await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
      start: '2021-06-01T20:10:01.312Z',
      end: '2021-06-01T20:12:01.312Z',
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-06-01T20:12:31.312Z',
      incidentId: incident.id
    })
    const event3 = await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b13',
      start: '2021-06-02T15:12:01.312Z',
      end: '2021-06-02T15:14:01.312Z',
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-06-02T15:14:31.312Z',
      incidentId: incident.id
    })
    await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b14',
      start: '2021-06-02T15:15:01.312Z',
      end: '2021-06-02T15:17:01.312Z',
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-06-02T15:18:31.312Z',
      incidentId: incident.id
    })
    await Event.create({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b15',
      start: '2021-06-02T16:01:01.312Z',
      end: '2021-06-02T16:10:01.312Z',
      streamId: 'aaaaaaaaa000',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-06-02T16:11:31.312Z',
      incidentId: incident.id
    })
    const requestBody = {
      investigatedAt: '2021-06-01T22:12:01.312Z',
      startedAt: '2021-06-01T22:35:21.000Z',
      submittedAt: '2021-06-01T22:36:05.000Z',
      answers: [101, 103, 202, 203, 301, 402],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    MockDate.reset()
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' }, fields: [...incidentAttributes.full, 'firstResponse', 'firstEvent', 'events'] })
    expect(incidents.length).toBe(2)
    expect(incidents[0].firstResponse.id).toBe(responses[0].id)
    expect(incidents[0].firstEvent.id).toBe(event.id)
    expect(incidents[0].ref).toBe(1)
    expect(incidents[0].events.length).toBe(2)
    expect(incidents[1].firstResponse).toBeNull()
    expect(incidents[1].firstEvent.id).toBe(event3.id)
    expect(incidents[1].ref).toBe(2)
    expect(incidents[1].events.length).toBe(3)
  })
  test('creates response with logging and poaching type', async () => {
    const requestBody = {
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      answers: [101, 103, 201, 204, 301, 402, 501, 502, 601, 602, 702],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list()
    const response = responses[0]
    expect(responses.length).toBe(1)
    expect(response.answers?.length).toBe(11)
    expect(response.answers?.map(e => e.id).includes(101)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(103)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(201)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(204)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(301)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(402)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(501)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(502)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(601)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(602)).toBeTruthy()
    expect(response.answers?.map(e => e.id).includes(702)).toBeTruthy()
  })
  test('creates response with other type', async () => {
    const requestBody = {
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      answers: [503],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list()
    const response = responses[0]
    expect(responses.length).toBe(1)
    expect(response.answers?.length).toBe(1)
    expect(response.answers?.map(e => e.id).includes(503)).toBeTruthy()
  })
})

describe('GET /responses/{id}', () => {
  test('returns response data', async () => {
    const incident1 = await Incident.create({ streamId: 'stream000000', projectId: 'project000000', ref: 1 })
    MockDate.set('2021-08-15T10:04:25.795Z')
    const response1 = await Response.create({
      streamId: 'stream000000',
      projectId: 'project000000',
      investigatedAt: '2021-08-15T10:02:22.795Z',
      startedAt: '2021-08-15T10:03:22.795Z',
      submittedAt: '2021-08-15T10:04:22.795Z',
      createdById: 1,
      incidentId: incident1.id,
      schemaVersion: 1
    })
    await ResponseAnswer.bulkCreate([
      { responseId: response1.id, answerId: 101 },
      { responseId: response1.id, answerId: 102 },
      { responseId: response1.id, answerId: 202 },
      { responseId: response1.id, answerId: 204 },
      { responseId: response1.id, answerId: 301 },
      { responseId: response1.id, answerId: 401 }
    ])
    MockDate.reset()
    await incident1.update({ firstResponseId: response1.id })

    const response = await request(app).get(`/${response1.id}`)
    expect(response.statusCode).toBe(200)
    const resp = response.body
    expect(resp.id).toBe(response1.id)
    expect(resp.streamId).toBe('stream000000')
    expect(resp.projectId).toBe('project000000')
    expect(resp.investigatedAt).toBe('2021-08-15T10:02:22.795Z')
    expect(resp.startedAt).toBe('2021-08-15T10:03:22.795Z')
    expect(resp.submittedAt).toBe('2021-08-15T10:04:22.795Z')
    expect(resp.answers.length).toBe(4)
    expect(resp.answers[0].question.id).toBe(1)
    expect(resp.answers[0].question.text).toBe(seedValues.questions.find(q => q.id === 1)?.text)
    expect(resp.answers[0].items.length).toBe(2)
    expect(resp.answers[0].items[0].id).toBe(101)
    expect(resp.answers[0].items[0].text).toBe(seedValues.answers.find(a => a.id === 101)?.text)
    expect(resp.answers[0].items[1].id).toBe(102)
    expect(resp.answers[0].items[1].text).toBe(seedValues.answers.find(a => a.id === 102)?.text)
    expect(resp.answers[1].question.id).toBe(2)
    expect(resp.answers[1].question.text).toBe(seedValues.questions.find(q => q.id === 2)?.text)
    expect(resp.answers[1].items.length).toBe(2)
    expect(resp.answers[1].items[0].id).toBe(202)
    expect(resp.answers[1].items[0].text).toBe(seedValues.answers.find(a => a.id === 202)?.text)
    expect(resp.answers[1].items[1].id).toBe(204)
    expect(resp.answers[1].items[1].text).toBe(seedValues.answers.find(a => a.id === 204)?.text)
    expect(resp.answers[2].question.id).toBe(3)
    expect(resp.answers[2].question.text).toBe(seedValues.questions.find(q => q.id === 3)?.text)
    expect(resp.answers[2].items.length).toBe(1)
    expect(resp.answers[2].items[0].id).toBe(301)
    expect(resp.answers[2].items[0].text).toBe(seedValues.answers.find(a => a.id === 301)?.text)
    expect(resp.answers[3].question.id).toBe(4)
    expect(resp.answers[3].question.text).toBe(seedValues.questions.find(q => q.id === 4)?.text)
    expect(resp.answers[3].items.length).toBe(1)
    expect(resp.answers[3].items[0].id).toBe(401)
    expect(resp.answers[3].items[0].text).toBe(seedValues.answers.find(a => a.id === 401)?.text)
    expect(resp.createdBy.firstname).toBe(seedValues.primaryFirstname)
    expect(resp.createdBy.lastname).toBe(seedValues.primaryLastname)
    expect(resp.createdBy.guid).toBe(seedValues.primaryGuid)
    expect(resp.createdBy.email).toBe(seedValues.primaryEmail)
    expect(resp.incident.id).toBe(incident1.id)
    expect(resp.incident.ref).toBe(1)
    expect(resp.incident.streamId).toBe('stream000000')
    expect(resp.incident.projectId).toBe('project000000')
    expect(resp.incident.createdAt).toBeDefined()
    expect(resp.incident.closedAt).toBeNull()
  })

  test('returns 404 when response not found', async () => {
    const response = await request(app).get('/some')
    expect(response.statusCode).toBe(404)
  })
})
