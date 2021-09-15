export interface IProjectQuery {
  only_public: boolean
  keyword: string
  limit: number
  offset: number
  sort: string
  fields: string[]
}

export interface IProject {
  id: string
  name: string
  isPublic: boolean
  externalId: number
}
