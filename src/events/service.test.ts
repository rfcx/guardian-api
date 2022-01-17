import MockDate from 'mockdate'
import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
import { GET, setupMockAxios, resetMockAxios } from '../common/axios/mock'
import { sequelize } from '../common/db'
import { createEvent, updateEvent } from './service'
import Classification from '../classifications/classification.model'
import Stream from '../streams/stream.model'
import streamsDao from '../streams/dao'
import Event from './event.model'
import { list } from './dao'
import classificationDao from '../classifications/dao'
import Incident, { incidentAttributes } from '../incidents/incident.model'
import incidentsDao from '../incidents/dao'
import Response from '../responses/models/response.model'

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

expressApp()

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
  await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
  await Stream.create({ id: 'stream000001', projectId: 'project000001', lastEventEnd: '2021-09-14T19:02:21.795Z' })
  setupMockAxios('core', GET, 'events/7b8c15a9-5bc0-4059-b8cd-ec26aea92b11', 200, {
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
    streamId: 'stream000001',
    start: '2021-09-14T19:59:48.795Z',
    end: '2021-09-14T20:03:21.795Z',
    createdAt: '2021-09-14T20:10:01.312Z',
    classification: {
      value: 'chainsaw',
      title: 'Chainsaw'
    }
  })
  setupMockAxios('core', GET, 'events/7b8c15a9-5bc0-4059-b8cd-ec26aea92b12', 200, {
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
    streamId: 'stream000001',
    start: '2021-09-14T20:05:48.795Z',
    end: '2021-09-14T20:08:21.795Z',
    createdAt: '2021-09-14T20:09:01.312Z',
    classification: {
      value: 'chainsaw',
      title: 'Chainsaw'
    }
  })
  setupMockAxios('core', GET, 'events/7b8c15a9-5bc0-4059-b8cd-ec26aea92b13', 200, {
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b13',
    streamId: 'stream000002',
    start: '2021-09-14T21:15:48.795Z',
    end: '2021-09-14T21:18:21.795Z',
    createdAt: '2021-09-14T21:19:01.312Z',
    classification: {
      value: 'chainsaw',
      title: 'Chainsaw'
    }
  })
  setupMockAxios('core', GET, 'events/7b8c15a9-5bc0-4059-b8cd-ec26aea92b14', 200, {
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b14',
    streamId: 'stream000002',
    start: '2021-09-14T21:20:48.795Z',
    end: '2021-09-14T21:24:21.795Z',
    createdAt: '2021-09-14T21:25:01.312Z',
    classification: {
      value: 'chainsaw',
      title: 'Chainsaw'
    }
  })
  setupMockAxios('core', GET, 'events/7b8c15a9-5bc0-4059-b8cd-ec26aea92b15', 200, {
    id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b15',
    streamId: 'stream000002',
    start: '2021-09-14T21:27:48.795Z',
    end: '2021-09-14T21:29:21.795Z',
    createdAt: '2021-09-14T21:29:31.312Z',
    classification: {
      value: 'chainsaw',
      title: 'Chainsaw'
    }
  })
  setupMockAxios('core', GET, 'streams/stream000001', 200, {
    id: 'stream000001',
    name: 'Stream 000001',
    latitude: 10,
    longitude: 20,
    project: {
      id: 'project000001',
      name: 'Project 000001'
    }
  })
  setupMockAxios('core', GET, 'streams/stream000002', 200, {
    id: 'stream000002',
    name: 'Stream 000002',
    latitude: 10,
    longitude: 20,
    project: {
      id: 'project000002',
      name: 'Project 000002'
    }
  })
})
beforeEach(async () => {
  await truncate([Event, Response, Incident])
})
afterAll(() => {
  resetMockAxios()
})

describe('createEvent function', () => {
  test('creates event', async () => {
    await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11' })
    const events: Event[] = await list()
    const event = events[0]
    const classifications: Classification[] = await classificationDao.list()
    const classification = classifications[0]
    const streams: Stream[] = await streamsDao.list()
    const stream = streams[0]
    expect(events.length).toBe(1)
    expect(event.id).toBe('7b8c15a9-5bc0-4059-b8cd-ec26aea92b11')
    expect(event.start?.toISOString()).toBe('2021-09-14T19:59:48.795Z')
    expect(event.end?.toISOString()).toBe('2021-09-14T20:03:21.795Z')
    expect(event.streamId).toBe('stream000001')
    expect(event.projectId).toBe('project000001')
    expect(event.classification.value).toBe(classification.value)
    expect(event.createdAt?.toISOString()).toBe('2021-09-14T20:10:01.312Z')
    expect(classifications.length).toBe(1)
    expect(classification.value).toBe('chainsaw')
    expect(classification.title).toBe('Chainsaw')
    expect(stream.id).toBe('stream000001')
    expect(stream.projectId).toBe('project000001')
    expect(stream.lastEventEnd.toISOString()).toBe('2021-09-14T20:03:21.795Z')
    expect(stream.hasOpenIncident).toBeTruthy()
  })
  describe('incidents creation', () => {
    test('creates incident if there are no open incidents', async () => {
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11' })
      const events: Event[] = await list()
      const event = events[0]
      expect(events.length).toBe(1)
      const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'events', 'responses', 'firstEvent', 'firstResponse'] })
      const incident = incidents[0]
      expect(incidents.length).toBe(1)
      expect(incident.streamId).toBe('stream000001')
      expect(incident.projectId).toBe('project000001')
      expect(incident.closedAt).toBeNull()
      expect(incident.events.map(e => e.id).includes(event.id)).toBeTruthy()
      expect(incident.responses.length).toBe(0)
      expect(incident.firstEvent.id).toBe(event.id)
      expect(incident.firstResponse).toBeNull()
    })
    test('creates incident if there is another incident but it first event was more than 7 days ago', async () => {
      const inc = await Incident.create({
        streamId: 'stream000001',
        projectId: 'project000001',
        ref: 1
      })
      const event1 = await Event.create({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
        start: '2021-08-14T19:59:48.795Z',
        end: '2021-08-14T20:03:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classificationId: 1,
        createdAt: '2021-08-14T20:10:01.312Z',
        incidentId: inc.id
      })
      await inc.update({ firstEventId: event1.id })
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12' })
      const events: Event[] = await list()
      const event = events[0]
      expect(events.length).toBe(2)
      const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'events', 'responses', 'firstEvent', 'firstResponse'] })
      const incident = incidents[0]
      expect(incidents.length).toBe(2)
      expect(incident.streamId).toBe('stream000001')
      expect(incident.projectId).toBe('project000001')
      expect(incident.closedAt).toBeNull()
      expect(incident.events.map(e => e.id).includes(event.id)).toBeTruthy()
      expect(incident.responses.length).toBe(0)
      expect(incident.firstEvent.id).toBe(event.id)
      expect(incident.firstResponse).toBeNull()
    })
    test('creates new incident if current incident has got response', async () => {
      const inc = await Incident.create({
        streamId: 'stream000001',
        projectId: 'project000001',
        ref: 1
      })
      const event1 = await Event.create({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classificationId: 1,
        createdAt: '2021-09-14T20:04:01.312Z',
        incidentId: inc.id
      })
      await inc.update({ firstEventId: event1.id })
      const resp = await Response.create({
        streamId: 'stream000001',
        projectId: 'project000001',
        investigatedAt: '2021-09-14T21:10:01.312Z',
        startedAt: '2021-09-14T21:15:01.312Z',
        submittedAt: '2021-09-14T21:16:01.312Z',
        loggingScale: 1,
        damageScale: 1,
        createdById: 1,
        incidentId: inc.id,
        schemaVersion: 1
      })
      await inc.update({ firstResponseId: resp.id })
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12' })
      const events: Event[] = await list()
      expect(events.length).toBe(2)
      const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'events', 'responses', 'firstEvent', 'firstResponse'] })
      const incident = incidents[0]
      expect(incidents.length).toBe(2)
      expect(incident.streamId).toBe('stream000001')
      expect(incident.projectId).toBe('project000001')
      expect(incident.closedAt).toBeNull()
      expect(incident.events.map(e => e.id).includes('7b8c15a9-5bc0-4059-b8cd-ec26aea92b12')).toBeTruthy()
      expect(incident.responses.length).toBe(0)
      expect(incident.firstEvent.id).toBe('7b8c15a9-5bc0-4059-b8cd-ec26aea92b12')
      expect(incident.firstResponse).toBeNull()
    })
    test('adds event to existing incident', async () => {
      const inc = await Incident.create({
        streamId: 'stream000001',
        projectId: 'project000001',
        ref: 1
      })
      const event1 = await Event.create({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
        start: '2021-09-14T19:31:48.795Z',
        end: '2021-09-14T19:36:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classificationId: 1,
        createdAt: '2021-09-14T19:37:01.312Z',
        incidentId: inc.id
      })
      await inc.update({ firstEventId: event1.id })
      MockDate.set('2021-09-14T20:12:00.000Z')
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12' })
      MockDate.reset()
      const events: Event[] = await list()
      expect(events.length).toBe(2)
      const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'events', 'responses', 'firstEvent', 'firstResponse'] })
      const incident = incidents[0]
      expect(incidents.length).toBe(1)
      expect(incident.streamId).toBe('stream000001')
      expect(incident.projectId).toBe('project000001')
      expect(incident.closedAt).toBeNull()
      expect(incident.responses.length).toBe(0)
      expect(incident.events.length).toBe(2)
      expect(incident.firstEvent.id).toBe(event1.id)
      expect(incident.firstResponse).toBeNull()
    })
    test('creates new incident if all previous are closed', async () => {
      const inc = await Incident.create({
        streamId: 'stream000001',
        projectId: 'project000001',
        ref: 1
      })
      const event1 = await Event.create({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classificationId: 1,
        createdAt: '2021-09-14T18:10:01.312Z',
        incidentId: inc.id
      })
      await inc.update({ firstEventId: event1.id, closedAt: '2021-09-14T20:09:01.312Z' })
      MockDate.set('2021-09-14T20:12:00.000Z')
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12' })
      MockDate.reset()
      const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'events'] })
      expect(incidents.length).toBe(2)
      expect(incidents[0].closedAt.toISOString()).toBe('2021-09-14T20:09:01.312Z')
      expect(incidents[1].closedAt).toBeNull()
      expect(incidents[0].events.length).toBe(1)
      expect(incidents[1].events.length).toBe(1)
      expect(incidents[1].ref).toBe(2)
    })
    test('creates new stream', async () => {
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b13' })
      const streams: Stream[] = await streamsDao.list()
      const stream = streams[0]
      expect(stream.id).toBe('stream000002')
      expect(stream.projectId).toBe('project000002')
      expect(stream.lastEventEnd.toISOString()).toBe('2021-09-14T21:18:21.795Z')
      expect(stream.lastIncidentEventsCount).toBe(1)
    })
    test('updates stream stats when several evenes are created', async () => {
      MockDate.set('2021-09-14T21:19:05.312Z')
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b13' })
      MockDate.set('2021-09-14T21:25:05.312Z')
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b14' })
      MockDate.set('2021-09-14T21:29:36.312Z')
      await createEvent({ id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b15' })
      MockDate.reset()
      const streams: Stream[] = await streamsDao.list()
      const stream = streams[0]
      expect(stream.id).toBe('stream000002')
      expect(stream.lastEventEnd.toISOString()).toBe('2021-09-14T21:29:21.795Z')
      expect(stream.lastIncidentEventsCount).toBe(3)
    })
  })
})

describe('updateEvent function', () => {
  test('updates event', async () => {
    const id = '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11'
    setupMockAxios('core', GET, `events/${id}`, 200, {
      id,
      streamId: 'stream000001',
      start: '2021-09-14T19:59:48.795Z',
      end: '2021-09-14T20:05:13.795Z',
      createdAt: '2021-09-14T20:10:01.312Z',
      classification: {
        value: 'chainsaw',
        title: 'Chainsaw'
      }
    })
    const inc = await Incident.create({
      streamId: 'stream000001',
      projectId: 'project000001',
      ref: 1
    })
    await Event.create({
      id,
      start: '2021-09-14T19:59:48.795Z',
      end: '2021-09-14T20:03:21.795Z',
      streamId: 'stream000001',
      projectId: 'project000001',
      classificationId: 1,
      createdAt: '2021-09-14T18:10:01.312Z',
      incidentId: inc.id
    })
    await inc.update({ firstEventId: id, closedAt: '2021-09-14T20:09:01.312Z' })

    await updateEvent({ id })

    const event = await Event.findOne({ where: { id } })
    expect((event as any).end.toISOString()).toBe('2021-09-14T20:05:13.795Z')
  })
})
