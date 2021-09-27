import routes from './router'
import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
import request from 'supertest'
import { sequelize } from '../common/db'
import Response from './models/response.model'
import { list } from './dao'

const app = expressApp()

app.use('/', routes)

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
})
beforeEach(async () => {
  await truncate([Response])
})

describe('POST /response', () => {
  test('creates response', async () => {
    const requestBody = {
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [201, 204],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
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
    expect(response.guardianId).toBe('aaaaaaaaa000')
  })
  test('creates two responses', async () => {
    const response1 = await request(app).post('/').send({
      investigatedAt: '2021-06-08T19:26:40.000Z',
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [202, 203],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    })
    const response2 = await request(app).post('/').send({
      investigatedAt: '2021-05-03T12:31:42.150Z',
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      evidences: [100],
      loggingScale: 2,
      damageScale: 3,
      responseActions: [200],
      guardianId: 'aaaaaaaaa012'
    })
    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    const responses: Response[] = await list({}, { order: { field: 'investigatedAt', dir: 'DESC' } })
    expect(responses.length).toBe(2)
    expect(responses[0].investigatedAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(responses[1].investigatedAt?.toISOString()).toBe('2021-05-03T12:31:42.150Z')
  })
  test('returns 400 if investigatedAt is not defined', async () => {
    const requestBody = {
      startedAt: '2021-06-09T15:35:21.000Z',
      submittedAt: '2021-06-09T15:38:05.000Z',
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: [201, 203, 205],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa000'
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
      guardianId: 'aaaaaaaaa012'
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
    expect(response.guardianId).toBe('aaaaaaaaa012')
  })
  test('returns 400 if guardianId is not defined', async () => {
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
