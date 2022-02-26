import { AxiosRequestConfig } from 'axios'
import { coreApiAxios, mediaApiAxios } from '../axios'
import { ProjectResponse, StreamResponse, EventResponse, ForwardedResponse, ForwardedArrayResponse, DetectionResponse, Guardian } from '../../types'
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
    params: { ...params, fields: ['id', 'name', 'latitude', 'longitude', 'project', 'timezone'] }
  }
  return await coreApiAxios.get('/streams', options)
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
    params: { ...params, fields: ['id', 'name', 'latitude', 'longitude', 'project', 'timezone'] }
  }
  return await coreApiAxios.get(`/streams/${id}`, options)
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
  return await coreApiAxios.get(`/events/${id}`, options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getDetections = async (streamId: string, token?: string, params: any = {}): Promise<ForwardedArrayResponse<DetectionResponse>> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
  const { start, end, ...rest } = params
  const options = {
    headers: { Authorization: token },
    params: {
      start: start.toISOString(),
      end: end.toISOString(),
      ...rest
    }
  }
  return await coreApiAxios.get(`/streams/${streamId}/detections`, options)
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
  return await coreApiAxios.get('/projects', options)
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
  return await coreApiAxios.get(`/projects/${id}`, options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getMedia = async (filename: string, token?: string): Promise<any> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
  const options: AxiosRequestConfig = {
    headers: { Authorization: token },
    responseType: 'stream'
  }
  return await mediaApiAxios.get(`/internal/assets/streams/${filename}`, options)
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}

export const getGuardian = async (id: string, token?: string, params: any = {}): Promise<ForwardedResponse<Guardian>> => {
  if (token === undefined) {
    token = `Bearer ${await getM2MToken()}`
  }
  const options = {
    headers: { Authorization: token }
  }
  return await coreApiAxios.get(`/v2/streams/${id}`, options)
    .then((response) => {
      return {
        data: snakeToCamel(response.data),
        headers: extractCoreHeaders(response.headers)
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    .catch(e => { throw mapAxiosErrorToCustom(e) })
}
