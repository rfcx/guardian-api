import { Document } from 'mongoose'

export interface IClassification {
  value: string
  title: string
}

export interface IClassificationModel extends Document, IClassification {}

export interface IClassificationFilters {
  values?: string[]
}
