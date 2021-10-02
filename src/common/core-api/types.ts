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
}

export interface StreamResponse {
  id: string
  name: string
  latitude: number
  longitude: number
  altitude: number
  project: ProjectResponse | null
}
