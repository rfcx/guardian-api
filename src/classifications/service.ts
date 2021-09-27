import Classification from './classification.model'
import { getByValue, create } from './dao'

export async function ensureClassificationExists (classification: Classification): Promise<Classification> {
  return await getByValue(classification.value) ?? await create(classification)
}
