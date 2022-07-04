import Classification from '../../classifications/classification.model'
import Incident from '../../incidents/incident.model'

export interface ForwardedResponse<T> {
  data: T
  headers: any
}

export interface ForwardedArrayResponse<T> {
  data: T[]
  headers: any
}

export interface ProjectResponse {
  id: string
  name: string
  isPublic?: boolean
  externalId?: boolean
}

export interface StreamResponse {
  id: string
  name: string
  latitude: number
  longitude: number
  altitude: number
  project: ProjectResponse | null
  timezone: string
  incidents?: {
    total: number
    items: Incident[]
  }
  guardianType?: string | null
  tags?: string[]
}

export interface DetectionResponse {
  stream_id: string
  start: string
  end: string
  confidence: number
  classification: Classification
}

export interface EventResponse {
  id: string
  start: string
  end: string
  streamId: string
  created_at: string
  classification: Classification
  createdAt: string
}

export interface ClassificationResponse {
  value: string
  title: string
  image: string
}

export interface ClusteredResponse {
  time_bucket: string
  aggregated_value: number
  first_start: string
  last_start: string
  classification: ClassificationResponse
}
