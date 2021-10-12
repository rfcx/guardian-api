export interface ProjectQuery {
  only_public: boolean
  keyword: string
  limit: number
  offset: number
  sort: string
  fields: string[]
}

export interface Project {
  id: string
  name: string
}
