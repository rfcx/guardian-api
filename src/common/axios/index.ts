import axios from 'axios'
import config from '../../config'

const instance = axios.create({
  baseURL: config.CORE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

export default instance
