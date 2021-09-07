// export interface ProjectResponse {
//   id: string
//   name: string
// }

// export interface CreateProjectRequest {
//   name: string
// }

// export interface UpdateProjectRequest {
//   id: string
//   name: string
// }

export interface IQuerySort {
  field: string
  order: 'asc' | 'desc'
}

export interface IQueryOptions {
  limit: number
  offset: number
  sort: IQuerySort
}

export * from '../common/user/types'
export * from '../reports/types'
