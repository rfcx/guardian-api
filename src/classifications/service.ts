import { IClassification, IClassificationModel } from '../types'
import { getByValue, create } from './dao'

export async function ensureClassificationExists (classificaton: IClassification): Promise<IClassificationModel> {
  return await getByValue(classificaton.value) ?? await create(classificaton)
}
