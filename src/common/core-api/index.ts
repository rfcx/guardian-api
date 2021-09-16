import axios from '../axios'
import { IProjectResponse, StreamResponse, IForwardedResponse } from './types'
import { snakeToCamel } from '../serializers/snake-camel'

const coreHeaders = ['total-items']

function extractCoreHeaders (headers: any = {}): object {
  return Object.keys(headers)
    .filter(key => coreHeaders.includes(key))
    .reduce((obj: any, key: string) => {
      obj[key] = headers[key]
      return obj
    }, {})
}

export const getStreams = async (token: string, params: any = {}): Promise<IForwardedResponse<StreamResponse>> => {
  const options = {
    headers: { Authorization: token },
    params: { ...params, fields: ['id', 'name', 'latitude', 'longitude', 'project'] }
  }
  const response = await axios.get('/streams', options)
  return {
    data: snakeToCamel(response.data),
    headers: extractCoreHeaders(response.headers)
  }
}

export const getProjects = async (token: string, params: unknown = {}): Promise<IForwardedResponse<IProjectResponse>> => {
  const options = {
    headers: { Authorization: token },
    params
  }
  const response = await axios.get('/projects', options)
  return {
    data: snakeToCamel(response.data),
    headers: extractCoreHeaders(response.headers)
  }
}
