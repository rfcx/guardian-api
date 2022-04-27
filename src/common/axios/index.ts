import axios from 'axios'
import config from '../../config'

export const instance = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

export const coreApiAxios = axios.create({
  baseURL: config.CORE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

export const noncoreApiAxios = axios.create({
  baseURL: config.NONCORE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

export const mediaApiAxios = axios.create({
  baseURL: config.MEDIA_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

export default instance
