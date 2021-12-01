export interface DetectionsQuery {
  start: Date
  end: Date
  classifications?: string[]
  min_confidence?: number
  limit: number
  offset: number
}
