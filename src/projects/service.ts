import * as api from '../common/core-api'
import { get } from './dao'
import { ProjectResponse } from '../types'
import { DEFAULT_INCIDENT_DAYS_RANGE } from './project.model'

export const getAllUserProjects = async (userToken: string): Promise<ProjectResponse[]> => {
  const forwardedResponse = await api.getProjects(userToken, {
    fields: ['id', 'name'], // not sure anyone will ever have more projects
    limit: 100000
  })
  return forwardedResponse.data
}

export const hasAccessToProject = async (projectId: string, userToken: string): Promise<boolean> => {
  await api.getProject(projectId, userToken)
  return true
}

export const getProjectIncidentRange = async (projectId?: string): Promise<number> => {
  if (projectId === undefined) {
    return DEFAULT_INCIDENT_DAYS_RANGE
  }
  const project = await get(projectId)
  return project !== null ? project.incidentRangeDays : DEFAULT_INCIDENT_DAYS_RANGE
}

export default { getAllUserProjects, hasAccessToProject, getProjectIncidentRange }
