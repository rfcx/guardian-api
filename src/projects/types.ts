export interface ProjectQuery {
  only_public: boolean
  keyword: string
  limit: number
  offset: number
  sort: string
  fields: string[]
}
