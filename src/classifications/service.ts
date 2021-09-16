import { ClassificationDao, ClassificationModel } from '../types'
import { getByValue, create } from './dao'

export async function ensureClassificationExists (classificaton: ClassificationDao): Promise<ClassificationModel> {
  return await getByValue(classificaton.value) ?? await create(classificaton)
}
