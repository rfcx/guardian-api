import axios from 'axios'
import config from '../../config'

const instance = axios.create({
  baseURL: config.CORE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})
// TODO I think `await Promise.reject(error) === error` so these are not needed
instance.interceptors.request.use(function (conf) {
  return conf
}, async function (error) {
  return await Promise.reject(error)
})
instance.interceptors.response.use(function (response) {
  return response
}, async function (error) {
  return await Promise.reject(error)
})
