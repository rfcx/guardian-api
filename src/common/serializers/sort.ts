import { QueryOptionsRFCx } from '../../types'

export const querySortToOrder = (sort: string): QueryOptionsRFCx['order'] => {
  return { field: sort.replace(/^-/, ''), dir: sort.startsWith('-') ? 'DESC' : 'ASC' }
}
