// import dayjs from 'dayjs'
// import utc from 'dayjs/plugin/utc'
// import { Op, Transactionable } from 'sequelize'
// import { applyTimeRangeToQuery } from '../common/db'
import Project from './project.model'
// import { ResponseFilters, ResponseCreationData, QueryOptionsRFCx } from '../types'
// import ResponseAnswer from './models/response-answer.model'
// import { availableIncludes } from './misc'

// dayjs.extend(utc)

export const get = async function (id: string): Promise<Project | null> {
  return await Project.findByPk(id)
}
