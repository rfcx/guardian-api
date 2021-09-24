import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op } from 'sequelize'
dayjs.extend(utc)

export const applyTimeRangeToQuery = function (where: any, columnName: string, start?: Date, end?: Date): void {
  if (start !== undefined || end !== undefined) {
    const startCond: object = { [Op.gte]: dayjs.utc(start).valueOf() } ?? undefined
    const endCond: object = { [Op.lt]: dayjs.utc(end).valueOf() } ?? undefined
    if (start !== undefined && end !== undefined) {
      where[columnName] = { $and: { ...startCond, ...endCond } } as any
    } else if (start !== undefined) {
      where[columnName] = startCond
    } else if (end !== undefined) {
      where[columnName] = endCond
    }
  }
}
