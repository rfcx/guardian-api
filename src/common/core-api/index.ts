import axios from '../axios'
import { ProjectResponse, StreamResponse, ForwardedResponse, ForwardedArrayResponse } from './types'
import { snakeToCamel } from '../serializers/snake-camel'
import { mapAxiosErrorToCustom } from '@rfcx/http-utils'

const coreHeaders = ['total-items']

function extractCoreHeaders (headers: any = {}): object {
  return Object.keys(headers)
    .filter(key => coreHeaders.includes(key))
    .reduce((obj: any, key: string) => {
      obj[key] = headers[key]
      return obj
    }, {})
}

export const getStreams = async (token: string, params: any = {}): Promise<ForwardedArrayResponse<StreamResponse>> => {
  const options = {
    headers: { Authorization: token },
    params: { ...params, fields: ['id', 'name', 'latitude', 'longitude', 'project'] }
  }
  return await axios.get('/streams', options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getStream = async (token: string, id: string, params: any = {}): Promise<ForwardedResponse<StreamResponse>> => {
  const options = {
    headers: { Authorization: token },
    params: { ...params, fields: ['id', 'name', 'latitude', 'longitude', 'project'] }
  }
  return await axios.get(`/streams/${id}`, options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getProjects = async (token: string, params: unknown = {}): Promise<ForwardedArrayResponse<ProjectResponse>> => {
  const options = {
    headers: { Authorization: token },
    params
  }
  return await axios.get('/projects', options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}
