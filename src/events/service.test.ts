import { migrate, truncate, expressApp, seed } from '../common/db/testing'
import { sequelize } from '../common/db'
import { createEvent } from './service'
import Classification from '../classifications/classification.model'
import Event from './event.model'
import { list } from './dao'
import classificationDao from '../classifications/dao'

expressApp()

beforeAll(async () => {
  await migrate(sequelize)
  await seed()
})
beforeEach(async () => {
  await truncate([Event])
})

describe('createEvent function', () => {
  test('creates event', async () => {
    await createEvent({
      id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b11',
      start: '2021-09-14T19:59:48.795Z',
      end: '2021-09-14T20:03:21.795Z',
      streamId: 'stream000001',
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
    expect(event.classificationId).toBe(classification.id)
    expect(event.createdAt?.toISOString()).toBe('2021-09-14T20:10:01.312Z')
    expect(classifications.length).toBe(1)
    expect(classification.value).toBe('chainsaw')
    expect(classification.title).toBe('Chainsaw')
  })
  test('fails creating event if `id` is missing', async () => {
    try {
      await createEvent({
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        streamId: 'stream000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      } as any)
    } catch (e) { }
    const events: Event[] = await list()
    expect(events.length).toBe(0)
  })
  test('fails creating event if `start` is missing', async () => {
    try {
      await createEvent({
        id: 'abc',
        end: '2021-09-14T20:03:21.795Z',
        streamId: 'stream000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      } as any)
    } catch (e) { }
    const events: Event[] = await list()
    expect(events.length).toBe(0)
  })
  test('fails creating event if `end` is missing', async () => {
    try {
      await createEvent({
        id: 'abc',
        start: '2021-09-14T19:59:48.795Z',
        streamId: 'stream000001',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      } as any)
    } catch (e) { }
    const events: Event[] = await list()
    expect(events.length).toBe(0)
  })
  test('fails creating event if `streamId` is missing', async () => {
    try {
      await createEvent({
        id: 'abc',
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        createdAt: '2021-09-14T20:10:01.312Z'
      } as any)
    } catch (e) { }
    const events: Event[] = await list()
    expect(events.length).toBe(0)
  })
  test('fails creating event if `classification` is missing', async () => {
    try {
      await createEvent({
        id: 'abc',
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        streamId: 'stream000001',
        createdAt: '2021-09-14T20:10:01.312Z'
      } as any)
    } catch (e) { }
    const events: Event[] = await list()
    expect(events.length).toBe(0)
  })
  test('fails creating event if `createdAt` is missing', async () => {
    try {
      await createEvent({
        id: 'abc',
        start: '2021-09-14T19:59:48.795Z',
        end: '2021-09-14T20:03:21.795Z',
        classification: {
          value: 'chainsaw',
          title: 'Chainsaw'
        },
        streamId: 'stream000001'
      } as any)
    } catch (e) { }
    const events: Event[] = await list()
    expect(events.length).toBe(0)
  })
})
