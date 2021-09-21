import { startDb, stopDb, truncateDbModels, expressApp } from '../common/db/testing/index'
import request from 'supertest'
import { DocumentType } from '@typegoose/typegoose'
import ReportModel, { Report } from './report.model'
import routes from './router'

const app = expressApp()

app.use('/', routes)

beforeAll(async () => {
  await startDb()
})
beforeEach(async () => {
  await truncateDbModels([ReportModel])
})
afterAll(async () => {
  await stopDb()
})

describe('POST /reports', () => {
  test('creates report', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(201)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    const report = reports[0]
    expect(reports.length).toBe(1)
    expect(report.encounteredAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(report.evidences?.includes(101)).toBeTruthy()
    expect(report.evidences?.includes(103)).toBeTruthy()
    expect(report.loggingScale).toBe(1)
    expect(report.damageScale).toBe(2)
    expect(report.responseActions?.includes('foo')).toBeTruthy()
    expect(report.responseActions?.includes('bar')).toBeTruthy()
    expect(report.note).toBe('Test note')
    expect(report.guardianId).toBe('aaaaaaaaa000')
  })
  test('creates two reports', async () => {
    const response1 = await request(app).post('/').send({
      encounteredAt: '2021-06-08T19:26:40.000Z',
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    })
    const response2 = await request(app).post('/').send({
      encounteredAt: '2021-05-03T12:31:42.150Z',
      evidences: [100],
      loggingScale: 2,
      damageScale: 3,
      responseActions: ['sms'],
      guardianId: 'aaaaaaaaa012'
    })
    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(2)
    expect(reports[0].encounteredAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(reports[1].encounteredAt?.toISOString()).toBe('2021-05-03T12:31:42.150Z')
  })
  test('returns 400 if encounteredAt is not defined', async () => {
    const requestBody = {
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if evidences is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      loggingScale: 1,
      damageScale: 2,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if evidences is empty', async () => {
    const requestBody = {
      evidences: [],
      encounteredAt: '2021-06-08T19:26:40.000Z',
      loggingScale: 1,
      damageScale: 2,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if evidences is not from the list', async () => {
    const requestBody = {
      evidences: [200],
      encounteredAt: '2021-06-08T19:26:40.000Z',
      loggingScale: 1,
      damageScale: 2,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if loggingScale is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      damageScale: 2,
      evidences: [101, 103],
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if damageScale is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      loggingScale: 1,
      evidences: [101, 103],
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if responseActions is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      evidences: [101, 103],
      loggingScale: 1,
      damageScale: 2,
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
  test('creates report if note is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-05-03T12:31:42.150Z',
      evidences: [102, 104, 105],
      loggingScale: 2,
      damageScale: 3,
      responseActions: ['sms'],
      guardianId: 'aaaaaaaaa012'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(201)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    const report = reports[0]
    expect(reports.length).toBe(1)
    expect(report.encounteredAt?.toISOString()).toBe('2021-05-03T12:31:42.150Z')
    expect(report.evidences?.length).toBe(3)
    expect(report.evidences?.includes(102)).toBeTruthy()
    expect(report.evidences?.includes(104)).toBeTruthy()
    expect(report.evidences?.includes(105)).toBeTruthy()
    expect(report.loggingScale).toBe(2)
    expect(report.damageScale).toBe(3)
    expect(report.responseActions?.length).toBe(1)
    expect(report.responseActions?.includes('sms')).toBeTruthy()
    expect(report.note).toBeUndefined()
    expect(report.guardianId).toBe('aaaaaaaaa012')
  })
  test('returns 400 if guardianId is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      evidences: [100],
      loggingScale: 0,
      damageScale: 0,
      responseActions: ['foo', 'bar'],
      note: 'Test note'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: Array<DocumentType<Report>> = await ReportModel.find()
    expect(reports.length).toBe(0)
  })
})
