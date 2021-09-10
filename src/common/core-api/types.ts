export interface IForwardedResponse<T> {
  data: T[]
  headers: any
}

export interface IProjectResponse {
  id: string
  name: string
}

export interface IStreamResponse {
  id: string
  name: string
  latitude: number
  longitude: number
  altitude: number
  project: IProjectResponse | null
}
