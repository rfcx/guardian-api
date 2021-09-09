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
  test('saves report', async () => {
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
})
