import MockDate from 'mockdate'
import routes from './router'
import { migrate, expressApp, seed, muteConsole } from '../common/db/testing'
import request from 'supertest'
import { sequelize } from '../common/db'
import Incident from '../incidents/incident.model'
import Response from '../responses/models/response.model'
import Event from '../events/event.model'
import Classification from '../classifications/classification.model'
const app = expressApp()

app.use('/', routes)

let incident1, incident2, incident3

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  incident1 = await Incident.create({ streamId: 'stream000000', projectId: 'project000000', ref: 1 })
  const event1 = await Event.create({
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
    start: '2021-08-14T19:59:48.795Z',
    end: '2021-08-14T20:03:21.795Z',
    streamId: 'stream000000',
    projectId: 'project000000',
    classificationId: 1,
    createdAt: '2021-08-14T20:10:01.312Z',
    incidentId: incident1.id
  })
  await incident1.update({ firstEventId: event1.id })
  await Event.create({
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
    start: '2021-08-14T21:05:48.795Z',
    end: '2021-08-14T21:31:22.795Z',
    streamId: 'stream000000',
    projectId: 'project000000',
    classificationId: 1,
    createdAt: '2021-08-14T21:32:00.121Z',
    incidentId: incident1.id
  })
  await Event.create({
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
    start: '2021-08-15T03:21:51.795Z',
    end: '2021-08-15T03:31:22.795Z',
    streamId: 'stream000000',
    projectId: 'project000000',
    classificationId: 1,
    createdAt: '2021-08-15T03:32:00.121Z',
    incidentId: incident1.id
  })
  MockDate.set('2021-08-15T10:04:25.795Z')
  const response1 = await Response.create({
    streamId: 'stream000000',
    projectId: 'project000000',
    investigatedAt: '2021-08-15T10:02:22.795Z',
    startedAt: '2021-08-15T10:03:22.795Z',
    submittedAt: '2021-08-15T10:04:22.795Z',
    loggingScale: 1,
    damageScale: 1,
    createdById: 1,
    incidentId: incident1.id,
    schemaVersion: 1
  })
  MockDate.reset()
  await incident1.update({ firstResponseId: response1.id })
  await incident1.update({ closedAt: '2021-08-16T12:32:11.211Z' })

  incident2 = await Incident.create({ streamId: 'stream000001', projectId: 'project000001', ref: 1 })
  const event2 = await Event.create({
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b13',
    start: '2021-09-02T11:32:21.110Z',
    end: '2021-09-02T11:46:43.210Z',
    streamId: 'stream000001',
    projectId: 'project000001',
    classificationId: 1,
    createdAt: '2021-09-02T11:47:00.210Z',
    incidentId: incident2.id
  })
  await incident2.update({ firstEventId: event2.id })

  incident3 = await Incident.create({ streamId: 'stream000002', projectId: 'project000001', ref: 2 })
  MockDate.set('2021-08-15T10:04:25.795Z')
  const response2 = await Response.create({
    streamId: 'stream000002',
    projectId: 'project000001',
    investigatedAt: '2021-09-14T15:54:21.110Z',
    startedAt: '2021-09-14T15:55:33.110Z',
    submittedAt: '2021-09-14T15:55:42.110Z',
    loggingScale: 1,
    damageScale: 1,
    createdById: 1,
    incidentId: incident3.id,
    schemaVersion: 1
  })
  MockDate.reset()
  await incident3.update({ firstResponseId: response2.id })
})
// beforeEach(async () => {
//   await truncate([Asset, Response, Event, Incident])
// })

describe('GET /incidents', () => {
  test('returns all incidents', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    expect(response.headers['total-items']).toBe('3')
    expect(response.body.length).toBe(3)
    expect(response.body[0].id).toBe(incident3.id)
    expect(response.body[1].id).toBe(incident2.id)
    expect(response.body[2].id).toBe(incident1.id)
    expect(response.body[0].events.length).toBe(0)
    expect(response.body[0].responses.length).toBe(1)
  })
  test('returns incident filtered by project id', async () => {
    const response = await request(app).get('/').query({ projects: ['project000001'] })
    expect(response.statusCode).toBe(200)
    expect(response.headers['total-items']).toBe('2')
    expect(response.body.length).toBe(2)
    expect(response.body.map(i => i.id).includes(incident2.id)).toBeTruthy()
    expect(response.body.map(i => i.id).includes(incident3.id)).toBeTruthy()
  })
  test('returns incident filtered by stream id', async () => {
    const response = await request(app).get('/').query({ streams: ['stream000002'] })
    expect(response.statusCode).toBe(200)
    expect(response.headers['total-items']).toBe('1')
    expect(response.body.length).toBe(1)
    expect(response.body.map(i => i.id).includes(incident3.id)).toBeTruthy()
  })
  test('returns closed incidents', async () => {
    const response = await request(app).get('/').query({ closed: true })
    expect(response.statusCode).toBe(200)
    expect(response.headers['total-items']).toBe('1')
    expect(response.body.length).toBe(1)
    expect(response.body.map(i => i.id).includes(incident1.id)).toBeTruthy()
  })
  test('returns opened incidents', async () => {
    const response = await request(app).get('/').query({ closed: false })
    expect(response.statusCode).toBe(200)
    expect(response.headers['total-items']).toBe('2')
    expect(response.body.length).toBe(2)
    expect(response.body.map(i => i.id).includes(incident2.id)).toBeTruthy()
    expect(response.body.map(i => i.id).includes(incident3.id)).toBeTruthy()
  })
})

describe('GET /incidents/{id}', () => {
  test('returns incident by id', async () => {
    const response = await request(app).get(`/${incident3.id as string}`)
    expect(response.statusCode).toBe(200)
    expect(response.body.id).toBe(incident3.id)
    expect(response.body.events.length).toBe(0)
    expect(response.body.responses.length).toBe(1)
  })
  test('returns 404 when incident not found', async () => {
    const response = await request(app).get('/some')
    expect(response.statusCode).toBe(404)
  })
})
