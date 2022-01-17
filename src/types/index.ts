import { Transaction } from 'sequelize'

export interface Env {
  AUTH0_DOMAIN: string
  AUTH0_CLIENT_ID: string
  AUTH0_CLIENT_SECRET: string
  AUTH0_AUDIENCE: string
  CORE_URL: string
  MEDIA_URL: string
  DB_HOSTNAME: string
  DB_NAME: string
  DB_USER: string
  DB_PASSWORD: string
  DB_PORT: number
  DB_SSL_ENABLED: boolean
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_KEY: string
  AWS_S3_BUCKET: string
  AWS_REGION_ID: string
  FIREBASE_CLIENT_EMAIL: string
  FIREBASE_PRIVATE_KEY: string
}

export interface QueryOrder {
  field: string
  dir: 'ASC' | 'DESC'
}

export interface QueryOptionsRFCx {
  limit?: number
  offset?: number
  order?: QueryOrder
  fields?: string[]
  transaction?: Transaction | null
}

export interface Attachment {
  id: string
  url: string
  note: string
}

export interface ListResults<T> {
  total: number
  results: T[]
}

export interface ModelAttributesLists {
  full: string[]
  lite: string[]
}

export declare function IsInCustom (arg: string[][] | number[][] | {
  msg: string
  args: string[][] | number[][]
}): Function

export * from '../assets/types'
export * from '../classifications/types'
export * from '../events/types'
export * from '../incidents/types'
export * from '../streams/types'
export * from '../projects/types'
export * from '../responses/types'
export * from '../users/types'
export * from '../common/core-api/types'
export * from '../common/firebase/types'
