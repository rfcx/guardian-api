// import MockDate from 'mockdate'
// import routes from './router'
// import { migrate, truncate, expressApp, seed, muteConsole } from '../common/db/testing'
// import { GET, setupMockAxios } from '../common/axios/mock'
// import request from 'supertest'
// import { sequelize } from '../common/db'
// import Incident from '../incidents/incident.model'
// import Event from '../events/event.model'
// import { list } from './dao'
// import Classification from '../classifications/classification.model'

// const app = expressApp()

// app.use('/', routes)

// beforeAll(async () => {
//   muteConsole()
//   await migrate(sequelize)
//   await seed()
//   await Classification.create({ value: 'chainsaw', title: 'Chainsaw' })
//   await Classification.create({ value: 'vehicle', title: 'Vehicle' })
//   await Classification.create({ value: 'gunshot', title: 'Gunshot' })
//   MockDate.set('2021-01-01T00:02:05.000Z')
//   const incident = await Incident.create({
//     streamId: 'aaaaaaaaa000',
//     projectId: 'project000001'
//   })
//   MockDate.reset()
//   const event1 = await Event.create({
//     id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b01',
//     start: '2021-01-01T00:00:00.000Z',
//     end: '2021-01-01T00:02:00.000Z',
//     createdAt: '2021-01-01T00:02:10.000Z',
//     streamId: 'aaaaaaaaa000',
//     projectId: 'project000001',
//     classificationId: 1,
//     incidentId: incident.id
//   })
//   await incident.update({ firstEventId: event1.id })
//   await Event.create({
//     id: '7b8c15a9-5bc0-4059-b8cd-ec26aea92b01',
//     start: '2021-01-01T00:00:00.000Z',
//     end: '2021-01-01T00:02:00.000Z',
//     createdAt: '2021-01-01T00:02:10.000Z',
//     streamId: 'aaaaaaaaa000',
//     projectId: 'project000001',
//     classificationId: 1,
//     incidentId: incident.id
//   })
// })
// beforeEach(async () => {
//   await truncate([Response, Event, Incident])
// })

// describe('GET /streams/{id}/events', () => {
//   test('returns 400 if investigatedAt is not defined', async () => {
//     const requestBody = {
//       startedAt: '2021-06-09T15:35:21.000Z',
//       submittedAt: '2021-06-09T15:38:05.000Z',
//       evidences: [101, 103],
//       loggingScale: 1,
//       damageScale: 2,
//       responseActions: [201, 203, 205],
//       note: 'Test note',
//       streamId: 'aaaaaaaaa000'
//     }
//     const reqResponse = await request(app).post('/').send(requestBody)
//     expect(reqResponse.statusCode).toBe(400)
//     const responses: Response[] = await list()
//     expect(responses.length).toBe(0)
//   })
// })
