import axios from '../axios'
import { ProjectResponse, StreamResponse, EventResponse, ForwardedResponse, ForwardedArrayResponse } from './types'
import { snakeToCamel } from '../serializers/snake-camel'
import { mapAxiosErrorToCustom } from '@rfcx/http-utils'
import { getM2MToken } from '../auth'

const coreHeaders = ['total-items']

function extractCoreHeaders (headers: any = {}): object {
  const h = Object.keys(headers)
    .filter(key => coreHeaders.includes(key))
    .reduce((obj: any, key: string) => {
      obj[key] = headers[key]
      return obj
    }, {})
  if (h['Total-Items'] !== undefined) {
    h['Access-Control-Expose-Headers'] = 'Total-Items'
  }
  return h
}

export const getStreams = async (token?: string, params: any = {}): Promise<ForwardedArrayResponse<StreamResponse>> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
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
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getStream = async (id: string, token?: string, params: any = {}): Promise<ForwardedResponse<StreamResponse>> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
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
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getEvent = async (id: string, token?: string, params: any = {}): Promise<ForwardedResponse<EventResponse>> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
  const options = {
    headers: { Authorization: token },
    params: { ...params, fields: ['id', 'start', 'end', 'created_at', 'stream_id', 'classification'] }
  }
  return await axios.get(`/events/${id}`, options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getProjects = async (token?: string, params: unknown = {}): Promise<ForwardedArrayResponse<ProjectResponse>> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
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
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getProject = async (id: string, token?: string, params: any = {}): Promise<ForwardedResponse<ProjectResponse>> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
  const options = {
    headers: { Authorization: token },
    params: { ...params, fields: ['id', 'name'] }
  }
  return await axios.get(`/projects/${id}`, options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}
