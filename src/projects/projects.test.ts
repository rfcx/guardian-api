import { GET, setupMockAxios } from '../common/axios/mock'
import { expressApp } from '../common/db/testing/index'
import request from 'supertest'
import routes from './router'

const app = expressApp()

app.use('/', routes)

const endpoint = 'projects'

describe('GET /projects', () => {
  test('get projects', async () => {
    const mockProject = [
      { id: 'bbbbbbbbbbbb', name: 'test-project-1', isPublic: true, externalId: null },
      { id: 'bbbbbbbbbbbc', name: 'test-project-2', isPublic: true, externalId: null }
    ]

    setupMockAxios(GET, endpoint, 200, mockProject)
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body[0]).toEqual(mockProject[0])
    expect(response.body[1]).toEqual(mockProject[1])
  })

  test('get empty projects', async () => {
    setupMockAxios(GET, endpoint, 200, [])
    const response = await request(app).get('/')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual([])
  })
})
