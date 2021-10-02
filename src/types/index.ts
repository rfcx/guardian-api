export interface Env {
  AUTH0_DOMAIN: string
  CORE_URL: string
  DB_HOSTNAME: string
  DB_NAME: string
  DB_USER: string
  DB_PASSWORD: string
  DB_PORT: number
  DB_SSL_ENABLED: boolean
}

export interface QueryOrder {
  field: string
  dir: 'ASC' | 'DESC'
}

export interface QueryOptionsRFCx {
  limit?: number
  offset?: number
  order?: QueryOrder
}

export interface Attachment {
  id: string
  url: string
  note: string
}

export declare function IsInCustom (arg: string[][] | number[][] | {
  msg: string
  args: string[][] | number[][]
}): Function

export * from '../classifications/types'
export * from '../events/types'
export * from '../incidents/types'
export * from '../streams/types'
export * from '../projects/types'
export * from '../responses/types'
export * from '../common/core-api/types'
