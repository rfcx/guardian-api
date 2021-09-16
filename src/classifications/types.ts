import { Document } from 'mongoose'

export interface ClassificationDao {
  value: string
  title: string
}

export interface ClassificationModel extends Document, ClassificationDao {}

export interface ClassificationFilters {
  values?: string[]
}
