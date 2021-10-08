import MockDate from 'mockdate'
import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
import { sequelize } from '../common/db'
import { createEvent } from './service'
import Classification from '../classifications/classification.model'
import Event from './event.model'
import { list } from './dao'
import classificationDao from '../classifications/dao'
import Incident, { incidentAttributes } from '../incidents/incident.model'
import incidentsDao from '../incidents/dao'
import Response from '../responses/models/response.model'

expressApp()

beforeAll(async () => {
  muteConsole()
  await migrate(sequelize)
  await seed()
})
beforeEach(async () => {
  await truncate([Event, Response, Incident])
})

describe('createEvent function', () => {
  test('creates event', async () => {
    await createEvent({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
      start: '2021-09-14T19:59:48.795Z',
      end: '2021-09-14T20:03:21.795Z',
      streamId: 'stream000001',
      projectId: 'project000001',
      classification: {
        value: 'chainsaw',
        title: 'Chainsaw'
      },
      createdAt: '2021-09-14T20:10:01.312Z'
    })
    const events: Event[] = await list()
    const event = events[0]
    const classifications: Classification[] = await classificationDao.list()
    const classification = classifications[0]
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
  })
  describe('incidents creation', () => {
    test('creates incident if there are no open incidents', async () => {
      await createEvent({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      })
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
      await createEvent({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      })
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
    test('creates incident if there is another incident with response', async () => {
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
        createdAt: '2021-09-14T18:10:01.312Z',
        incidentId: inc.id
      })
      await inc.update({ firstEventId: event1.id })
      const resp = await Response.create({
        streamId: 'stream000001',
        projectId: 'project000001',
        investigatedAt: '2021-09-14T19:10:01.312Z',
        startedAt: '2021-09-14T19:15:01.312Z',
        submittedAt: '2021-09-14T19:16:01.312Z',
        loggingScale: 1,
        damageScale: 1,
        createdById: 1,
        incidentId: inc.id,
        schemaVersion: 1
      })
      await inc.update({ firstResponseId: resp.id })
      await createEvent({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
        start: '2021-09-14T20:05:48.795Z',
        end: '2021-09-14T20:08:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      })
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
    test('adds event to existing incident', async () => {
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
        createdAt: '2021-09-14T18:10:01.312Z',
        incidentId: inc.id
      })
      await inc.update({ firstEventId: event1.id })
      MockDate.set('2021-09-14T20:12:00.000Z')
      await createEvent({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
        start: '2021-09-14T20:05:48.795Z',
        end: '2021-09-14T20:08:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      })
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
        start: '2021-08-14T19:59:48.795Z',
        end: '2021-08-14T20:03:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classificationId: 1,
        createdAt: '2021-09-14T18:10:01.312Z',
        incidentId: inc.id
      })
      await inc.update({ firstEventId: event1.id, closedAt: '2021-09-14T20:09:01.312Z' })
      MockDate.set('2021-09-14T20:12:00.000Z')
      await createEvent({
        id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b12',
        start: '2021-09-14T20:05:48.795Z',
        end: '2021-09-14T20:08:21.795Z',
        streamId: 'stream000001',
        projectId: 'project000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      })
      MockDate.reset()
      const incidents: Incident[] = await incidentsDao.list({}, { fields: [...incidentAttributes.full, 'events'] })
      expect(incidents.length).toBe(2)
      expect(incidents[0].closedAt.toISOString()).toBe('2021-09-14T20:09:01.312Z')
      expect(incidents[1].closedAt).toBeNull()
      expect(incidents[0].events.length).toBe(1)
      expect(incidents[1].events.length).toBe(1)
      expect(incidents[1].ref).toBe(2)
    })
  })
})
