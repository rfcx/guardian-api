import { IClassification, IClassificationModel } from '../types'
import Classification from './classification.model'

export async function getByValue (value: IClassification['value']): Promise<IClassificationModel | null> {
  return await Classification.findOne({ value })
}

export async function create (data: IClassification): Promise<IClassificationModel> {
  return await Classification.create(data)
}
