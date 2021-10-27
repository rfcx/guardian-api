import * as api from '../common/core-api'
import { Project } from './types'

export const getAllUserProjects = async (userToken: string): Promise<Project[]> => {
  const forwardedResponse = await api.getProjects(userToken, {
    fields: ['id', 'name'], // not sure anyone will ever have more projects
    limit: 100000
  })
  return forwardedResponse.data
}
