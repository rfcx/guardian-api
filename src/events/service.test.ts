import { startDb, stopDb, truncateDbModels, muteConsole } from '../common/db/testing/index'
import { createEvent } from './service'
import Event from './event.model'
import Classification from '../classifications/classification.model'
import { EventModel, ClassificationModel } from '../types'

beforeAll(async () => {
  muteConsole()
  await startDb()
})
beforeEach(async () => {
  await truncateDbModels([Classification, Event])
})
afterAll(async () => {
  await stopDb()
})

describe('createEvent function', () => {
  test('creates event', async () => {
    await createEvent({
      id: 'abc',
      start: '2021-09-14T19:59:48.795Z',
      end: '2021-09-14T20:03:21.795Z',
      streamId: 'stream000001',
      classification: {
        value: 'chainsaw',
        title: 'Chainsaw'
      },
      createdAt: '2021-09-14T20:10:01.312Z'
    })
    const events: EventModel[] = await Event.find()
    const event = events[0]
    const classifications: ClassificationModel[] = await Classification.find()
    const classification = classifications[0]
    expect(events.length).toBe(1)
    expect(event.externalId).toBe('abc')
    expect(event.start.toISOString()).toBe('2021-09-14T19:59:48.795Z')
    expect(event.end.toISOString()).toBe('2021-09-14T20:03:21.795Z')
    expect(event.streamId).toBe('stream000001')
    expect(event.classification.toString()).toBe(classification._id.toString())
    expect(event.createdAt.toISOString()).toBe('2021-09-14T20:10:01.312Z')
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
    const events: EventModel[] = await Event.find()
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
    const events: EventModel[] = await Event.find()
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
    const events: EventModel[] = await Event.find()
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
    const events: EventModel[] = await Event.find()
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
    const events: EventModel[] = await Event.find()
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
    const events: EventModel[] = await Event.find()
    expect(events.length).toBe(0)
  })
})
