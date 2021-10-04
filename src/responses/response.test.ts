import MockDate from 'mockdate'
import routes from './router'
import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
import { GET, setupMockAxios } from '../common/axios/mock'
import request from 'supertest'
import { sequelize } from '../common/db'
import Response from './models/response.model'
import Incident from '../incidents/incident.model'
import Event from '../events/event.model'
import { list } from './dao'
import incidentsDao from '../incidents/dao'
import Classification from '../classifications/classification.model'

const app = expressApp()

app.use('/', routes)

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  setupMockAxios(GET, 'streams/aaaaaaaaa000', 200, { project: { id: 'project000001' } })
  await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
})
beforeEach(async () => {
  await truncate([Response, Event, Incident])
})

describe('POST /response', () => {
  describe('validation', () => {
    test('returns 400 if investigatedAt is not defined', async () => {
      const requestBody = {
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        evidences: [101, 103],
        loggingScale: 1,
        damageScale: 2,
        responseActions: [201, 203, 205],
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
        evidences: [101, 103],
        loggingScale: 1,
        damageScale: 2,
        responseActions: [201, 203, 205],
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
        evidences: [101, 103],
        loggingScale: 1,
        damageScale: 2,
        responseActions: [201, 203, 205],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if evidences is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        loggingScale: 1,
        damageScale: 2,
        responseActions: [201, 203],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if evidences is empty', async () => {
      const requestBody = {
        evidences: [],
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        loggingScale: 1,
        damageScale: 2,
        responseActions: [201, 203],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if evidences is not from the list', async () => {
      const requestBody = {
        evidences: [200],
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        loggingScale: 1,
        damageScale: 2,
        responseActions: [201, 203],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if responseActions is empty', async () => {
      const requestBody = {
        evidences: [101, 103],
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        loggingScale: 1,
        damageScale: 2,
        responseActions: [],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if responseActions is not from the list', async () => {
      const requestBody = {
        evidences: [200],
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        loggingScale: 1,
        damageScale: 2,
        responseActions: [100, 203],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if loggingScale is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        damageScale: 2,
        evidences: [101, 103],
        responseActions: [201, 203],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if damageScale is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        loggingScale: 1,
        evidences: [101, 103],
        responseActions: [201, 203],
        note: 'Test note',
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
    test('returns 400 if responseActions is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        evidences: [101, 103],
        loggingScale: 1,
        damageScale: 2,
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
        evidences: [102, 104, 105],
        loggingScale: 2,
        damageScale: 3,
        responseActions: [200],
        streamId: 'aaaaaaaaa000'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(201)
      const responses: Response[] = await list()
      const response = responses[0]
      expect(responses.length).toBe(1)
      expect(response.investigatedAt?.toISOString()).toBe('2021-05-03T12:31:42.150Z')
      expect(response.evidences?.length).toBe(3)
      expect(response.evidences?.map(e => e.id).includes(102)).toBeTruthy()
      expect(response.evidences?.map(e => e.id).includes(104)).toBeTruthy()
      expect(response.evidences?.map(e => e.id).includes(105)).toBeTruthy()
      expect(response.loggingScale).toBe(2)
      expect(response.damageScale).toBe(3)
      expect(response.actions?.length).toBe(1)
      expect(response.actions?.map(e => e.id).includes(200)).toBeTruthy()
      expect(response.streamId).toBe('aaaaaaaaa000')
    })
    test('returns 400 if streamId is not defined', async () => {
      const requestBody = {
        investigatedAt: '2021-06-08T19:26:40.000Z',
        startedAt: '2021-06-09T15:35:21.000Z',
        submittedAt: '2021-06-09T15:38:05.000Z',
        evidences: [100],
        loggingScale: 0,
        damageScale: 0,
        responseActions: [201, 203],
        note: 'Test note'
      }
      const reqResponse = await request(app).post('/').send(requestBody)
      expect(reqResponse.statusCode).toBe(400)
      const responses: Response[] = await list()
      expect(responses.length).toBe(0)
    })
  })
  test('creates response and one incident', async () => {
    const requestBody = {
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [201, 204],
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
    expect(response.evidences?.map(e => e.id).includes(101)).toBeTruthy()
    expect(response.evidences?.map(e => e.id).includes(103)).toBeTruthy()
    expect(response.loggingScale).toBe(1)
    expect(response.damageScale).toBe(2)
    expect(response.actions?.map(e => e.id).includes(201)).toBeTruthy()
    expect(response.actions?.map(e => e.id).includes(204)).toBeTruthy()
    expect(response.streamId).toBe('aaaaaaaaa000')
    expect(response.projectId).toBe('project000001')
    const incidents: Incident[] = await incidentsDao.list()
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
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [202, 203],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    })
    const response2 = await request(app).post('/').send({
      investigatedAt: '2021-06-08T19:51:40.000Z',
      startedAt: '2021-06-08T19:55:02.000Z',
      submittedAt: '2021-06-08T19:57:06.000Z',
      evidences: [100],
      loggingScale: 2,
      damageScale: 3,
      responseActions: [200],
      streamId: 'aaaaaaaaa000'
    })
    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'investigatedAt', dir: 'ASC' } })
    expect(responses.length).toBe(2)
    expect(responses[0].investigatedAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(responses[1].investigatedAt?.toISOString()).toBe('2021-06-08T19:51:40.000Z')
    const incidents: Incident[] = await incidentsDao.list()
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
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [202, 203],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    })
    const response2 = await request(app).post('/').send({
      investigatedAt: '2021-06-10T19:51:40.000Z',
      startedAt: '2021-06-10T19:55:02.000Z',
      submittedAt: '2021-06-10T19:57:06.000Z',
      evidences: [100],
      loggingScale: 2,
      damageScale: 3,
      responseActions: [200],
      streamId: 'aaaaaaaaa000'
    })
    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'investigatedAt', dir: 'ASC' } })
    expect(responses.length).toBe(2)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' } })
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
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [201, 204],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    MockDate.reset()
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    expect(responses.length).toBe(1)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' } })
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
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [201, 204],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    MockDate.reset()
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    expect(responses.length).toBe(1)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' } })
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
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [201, 204],
      note: 'Test note',
      streamId: 'aaaaaaaaa000'
    }
    MockDate.reset()
    const reqResponse = await request(app).post('/').send(requestBody)
    expect(reqResponse.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    expect(responses.length).toBe(1)
    const incidents: Incident[] = await incidentsDao.list({}, { order: { field: 'createdAt', dir: 'ASC' } })
    expect(incidents.length).toBe(2)
    expect(incidents[1].streamId).toBe('aaaaaaaaa000')
    expect(incidents[1].projectId).toBe('project000001')
    expect(incidents[1].firstResponse.id).toBe(responses[0].id)
    expect(incidents[1].ref).toBe(1)
  })
})
