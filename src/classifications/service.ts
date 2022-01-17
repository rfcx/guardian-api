import { Transactionable } from 'sequelize'
import Classification from './classification.model'
import { getByValue, create } from './dao'

export async function ensureClassificationExists (classification: Classification, o: Transactionable = {}): Promise<Classification> {
  return await getByValue(classification.value, o) ?? await create(classification, o)
}
