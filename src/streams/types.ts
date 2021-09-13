export interface IStreamQuery {
  projects: string[]
  only_public: boolean
  keyword: string
  limit: number
  offset: number
  sort: string
  fields: string[]
}
