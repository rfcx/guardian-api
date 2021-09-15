export interface IEnv {
  AUTH0_DOMAIN: string
  CORE_URL: string
  DB_HOSTNAME: string
  DB_NAME: string
  DB_USER: string
  DB_PASSWORD: string
  DB_PORT: string
}

export interface IQuerySort {
  field: string
  order: 'asc' | 'desc'
}

export interface IQueryOptions {
  limit?: number
  offset?: number
  sort?: IQuerySort
}

export * from '../users/types'
export * from '../classifications/types'
export * from '../events/types'
export * from '../streams/types'
export * from '../projects/types'
export * from '../reports/types'
export * from '../common/core-api/types'
