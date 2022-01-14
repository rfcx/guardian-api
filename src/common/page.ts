export function limitAndOffset <T> (items: T[], limit: number, offset: number): T[] {
  if (limit < 0) {
    throw Error('limit must be greater than or equal to 0')
  }
  if (offset < 0) {
    throw Error('offset must be greater than or equal to 0')
  }
  return items.slice(offset, offset + limit)
}
