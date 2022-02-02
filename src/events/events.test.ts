import MockDate from 'mockdate'
import routes from './router'
import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
import { GET, setupMockAxios, resetMockAxios } from '../common/axios/mock'
import request from 'supertest'
import { sequelize } from '../common/db'
import Response from '../responses/models/response.model'
import Incident from '../incidents/incident.model'
import Event from '../events/event.model'
import Asset from '../assets/asset.model'
import Classification from '../classifications/classification.model'
import Stream from '../streams/stream.model'
import Project from '../projects/project.model'
const app = expressApp()
jest.mock('../common/auth', () => {
  return {
    getM2MToken: jest.fn(() => 'mocked token')
  }
})
jest.mock('../common/firebase', () => {
  return {
    sendToTopic: jest.fn(() => 'sent')
  }
})

let incident1, event2, event3
const streamId = 'stream000000'
const projectId = 'project000001'
const classificationId = 1

app.use('/', routes)

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  setupMockAxios('core', GET, `streams/${streamId}`, 200, { id: streamId, name: 'Stream 1', project: { id: projectId } })
  await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  await Stream.create({ id: streamId, projectId, lastEventEnd: '2021-06-09T15:38:05.000Z' })
})
beforeEach(async () => {
  incident1 = await Incident.create({ streamId, projectId, ref: 1 })
  const event1 = await Event.create({
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
    start: '2021-08-14T19:59:48.795Z',
    end: '2021-08-14T20:03:21.795Z',
    streamId,
    projectId,
    classificationId,
    createdAt: '2021-08-14T20:10:01.312Z',
    incidentId: incident1.id
  })
  await incident1.update({ firstEventId: event1.id })
})
afterEach(async () => {
  await truncate([Asset, Response, Event, Project])
})
afterAll(() => {
  resetMockAxios()
})

describe('GET /streams/:id/last-events', () => {
  describe('positive result', () => {
    beforeEach(async () => {
      MockDate.set('2021-08-15T10:04:25.795Z')
      const response1 = await Response.create({
        streamId,
        projectId,
        investigatedAt: '2021-08-15T10:02:22.795Z',
        startedAt: '2021-08-15T10:03:22.795Z',
        submittedAt: '2021-08-15T10:04:22.795Z',
        loggingScale: 1,
        damageScale: 1,
        createdById: 1,
        incidentId: incident1.id,
        schemaVersion: 1
      })
      MockDate.set('2021-08-17T10:04:25.795Z')
      event2 = await Event.create({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
        start: '2021-08-16T21:05:48.795Z',
        end: '2021-08-16T21:31:22.795Z',
        streamId,
        projectId,
        classificationId,
        createdAt: '2021-08-16T21:32:00.121Z',
        incidentId: incident1.id
      })
      event3 = await Event.create({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b13',
        start: '2021-08-16T03:21:51.795Z',
        end: '2021-08-16T03:31:22.795Z',
        streamId,
        projectId,
        classificationId,
        createdAt: '2021-08-16T03:32:00.121Z',
        incidentId: incident1.id
      })
      await incident1.update({ firstResponseId: response1.id })
    })
    afterAll(() => {
      MockDate.reset()
    })
    test('returns 2 events for project which is not in database', async () => {
      const response = await request(app).get(`/streams/${streamId}/last-events`)
      MockDate.reset()
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(2)
      expect(response.body[0].id).toBe(event2.id)
      expect(response.body[1].id).toBe(event3.id)
    })
    test('returns 2 events for project which exists in database and has default 7 days range', async () => {
      await Project.create({ id: projectId, incidentRangeDays: 7 })
      const response = await request(app).get(`/streams/${streamId}/last-events`)
      MockDate.reset()
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(2)
      expect(response.body[0].id).toBe(event2.id)
      expect(response.body[1].id).toBe(event3.id)
    })
    test('returns 2 events for project which has default 30 days range', async () => {
      await Project.create({ id: projectId, incidentRangeDays: 30 })
      MockDate.set('2021-08-20T10:04:25.795Z')
      const response = await request(app).get(`/streams/${streamId}/last-events`)
      expect(response.statusCode).toBe(200)
      expect(response.body[0].id).toBe(event2.id)
      expect(response.body[1].id).toBe(event3.id)
    })
    test('returns 0 events for project which has default 1 day range', async () => {
      await Project.create({ id: projectId, incidentRangeDays: 1 })
      MockDate.set('2021-08-20T10:04:25.795Z')
      const response = await request(app).get(`/streams/${streamId}/last-events`)
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(0)
    })
  })
})
