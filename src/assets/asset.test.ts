import routes from './router'
import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
import request from 'supertest'
import { sequelize } from '../common/db'
import Asset from './asset.model'
import Incident from '../incidents/incident.model'
import Response from '../responses/models/response.model'
import Stream from '../streams/stream.model'

const app = expressApp()

app.use('/', routes)

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  await Stream.create({ id: 'stream000001', lastEventEnd: '2021-06-09T15:38:05.000Z' })
})
beforeEach(async () => {
  await truncate([Asset, Response, Incident])
})

describe('DELETE /assets/:id', () => {
  test('delete assets success', async () => {
    const incident = await Incident.create({
      streamId: 'stream000001',
      projectId: 'project000001',
      ref: 1
    })
    const resp = await Response.create({
      streamId: 'stream000001',
      projectId: 'project000001',
      investigatedAt: '2021-09-14T19:10:01.312Z',
      startedAt: '2021-09-14T19:15:01.312Z',
      submittedAt: '2021-09-14T19:16:01.312Z',
      loggingScale: 1,
      damageScale: 1,
      createdById: 1,
      incidentId: incident.id,
      schemaVersion: 1
    })
    await incident.update({ firstResponseId: resp.id })
    const mockAsset = { fileName: 'test-file', mimeType: 'image/jpeg', responseId: resp.id, createdById: 1 }
    const asset = await Asset.create(mockAsset)

    const response = await request(app).delete(`/${asset.id}`)
    expect(response.statusCode).toBe(204)
  })

  test('delete not existing asset', async () => {
    expect(true).toBeTruthy()
    const assetId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

    const response = await request(app).delete(`/${assetId}`)
    expect(response.statusCode).toBe(404)
  })
})
