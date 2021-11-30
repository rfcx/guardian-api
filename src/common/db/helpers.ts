import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op, Model } from 'sequelize'
import { QueryOptionsRFCx } from '../../types'
import { sequelize } from './index'
dayjs.extend(utc)

export const applyTimeRangeToQuery = function (where: any, columnName: string, start?: Date, end?: Date): void {
  if (where === undefined) {
    where = {}
  }
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

export const querySortToOrder = (sort: string): QueryOptionsRFCx['order'] => {
  return { field: sort.replace(/^-/, ''), dir: sort.startsWith('-') ? 'DESC' : 'ASC' }
}

export const includeBuilder = (model: Model, attributes: string[], as: string) => {
  return (options = {}) => {
    const defaults = {
      as,
      attributes
    }
    return { model, ...defaults, ...options }
  }
}

export const getResponseTime = async (): Promise<number> => {
  const start = Date.now()
  try {
    await sequelize.authenticate()
  } catch (e) {
    console.error('Can not get database status')
  }
  return Date.now() - start
}

export default { applyTimeRangeToQuery, querySortToOrder, includeBuilder, getResponseTime }
