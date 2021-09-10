import { startDb, stopDb, truncateDbModels, expressApp } from '../common/db/testing/index'
import request from 'supertest'
import Report from './report.model'
import routes from './router'
import { IReportModel } from './types'

const app = expressApp()

app.use('/', routes)

beforeAll(async () => {
  await startDb()
})
beforeEach(async () => {
  await truncateDbModels([Report])
})
afterAll(async () => {
  await stopDb()
})

describe('POST /reports', () => {
  test('creates report', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isLoggerEncountered: true,
      isEvidenceEncountered: true,
      evidences: ['abc', 'fde'],
      loggingScale: 1,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(201)
    const reports: IReportModel[] = await Report.find()
    const report = reports[0]
    expect(reports.length).toBe(1)
    expect(report.encounteredAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(report.isLoggerEncountered).toBeTruthy()
    expect(report.isEvidenceEncountered).toBeTruthy()
    expect(report.evidences?.includes('abc')).toBeTruthy()
    expect(report.evidences?.includes('fde')).toBeTruthy()
    expect(report.loggingScale).toBe(1)
    expect(report.responseActions?.includes('foo')).toBeTruthy()
    expect(report.responseActions?.includes('bar')).toBeTruthy()
    expect(report.note).toBe('Test note')
    expect(report.guardianId).toBe('aaaaaaaaa000')
  })
  test('creates two reports', async () => {
    const response1 = await request(app).post('/').send({
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isLoggerEncountered: true,
      isEvidenceEncountered: true,
      evidences: ['abc', 'fde'],
      loggingScale: 1,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    })
    const response2 = await request(app).post('/').send({
      encounteredAt: '2021-05-03T12:31:42.150Z',
      isLoggerEncountered: false,
      isEvidenceEncountered: true,
      evidences: ['tree'],
      loggingScale: 2,
      responseActions: ['sms'],
      guardianId: 'aaaaaaaaa012'
    })
    expect(response1.statusCode).toBe(201)
    expect(response2.statusCode).toBe(201)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(2)
    expect(reports[0].encounteredAt?.toISOString()).toBe('2021-06-08T19:26:40.000Z')
    expect(reports[1].encounteredAt?.toISOString()).toBe('2021-05-03T12:31:42.150Z')
  })
  test('returns 400 if encounteredAt is not defined', async () => {
    const requestBody = {
      isLoggerEncountered: true,
      isEvidenceEncountered: true,
      evidences: ['abc', 'fde'],
      loggingScale: 1,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if isLoggerEncountered is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isEvidenceEncountered: true,
      evidences: ['abc', 'fde'],
      loggingScale: 1,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if isEvidenceEncountered is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isLoggerEncountered: true,
      evidences: ['abc', 'fde'],
      loggingScale: 1,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if evidences is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isLoggerEncountered: true,
      isEvidenceEncountered: true,
      loggingScale: 1,
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if loggingScale is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isLoggerEncountered: true,
      isEvidenceEncountered: true,
      evidences: ['abc', 'fde'],
      responseActions: ['foo', 'bar'],
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(0)
  })
  test('returns 400 if responseActions is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isLoggerEncountered: true,
      isEvidenceEncountered: true,
      evidences: ['abc', 'fde'],
      loggingScale: 1,
      note: 'Test note',
      guardianId: 'aaaaaaaaa000'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(0)
  })
  test('creates report if note is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-05-03T12:31:42.150Z',
      isLoggerEncountered: false,
      isEvidenceEncountered: true,
      evidences: ['tree'],
      loggingScale: 2,
      responseActions: ['sms'],
      guardianId: 'aaaaaaaaa012'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(201)
    const reports: IReportModel[] = await Report.find()
    const report = reports[0]
    expect(reports.length).toBe(1)
    expect(report.encounteredAt?.toISOString()).toBe('2021-05-03T12:31:42.150Z')
    expect(report.isLoggerEncountered).toBeFalsy()
    expect(report.isEvidenceEncountered).toBeTruthy()
    expect(report.evidences?.length).toBe(1)
    expect(report.evidences?.includes('tree')).toBeTruthy()
    expect(report.loggingScale).toBe(2)
    expect(report.responseActions?.length).toBe(1)
    expect(report.responseActions?.includes('sms')).toBeTruthy()
    expect(report.note).toBeUndefined()
    expect(report.guardianId).toBe('aaaaaaaaa012')
  })
  test('returns 400 if guardianId is not defined', async () => {
    const requestBody = {
      encounteredAt: '2021-06-08T19:26:40.000Z',
      isLoggerEncountered: true,
      isEvidenceEncountered: true,
      evidences: ['abc', 'fde'],
      loggingScale: 1,
      responseActions: ['foo', 'bar'],
      note: 'Test note'
    }
    const response = await request(app).post('/').send(requestBody)
    expect(response.statusCode).toBe(400)
    const reports: IReportModel[] = await Report.find()
    expect(reports.length).toBe(0)
  })
})
