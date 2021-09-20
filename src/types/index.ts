export interface Env {
  AUTH0_DOMAIN: string
  CORE_URL: string
  DB_HOSTNAME: string
  DB_NAME: string
  DB_USER: string
  DB_PASSWORD: string
  DB_PORT: string
}

export interface QuerySort {
  field: string
  order: 'asc' | 'desc'
}

export interface QueryOptionsRFCx {
  limit?: number
  offset?: number
  sort?: QuerySort
}

export interface Attachment {
  id: string
  url: string
  note: string
}

export * from '../classifications/types'
export * from '../events/types'
export * from '../streams/types'
export * from '../projects/types'
export * from '../reports/types'
export * from '../common/core-api/types'

