import type { Request, Response, NextFunction } from 'express'
import { QueryTypes } from 'sequelize'
import { Sequelize, DataType } from 'sequelize-typescript'
import * as fs from 'fs'
import * as path from 'path'
import express, { Express } from 'express'
import ResponseModel from '../../responses/models/response.model'
import QuestionType from '../../responses/models/question-type.model'
import Question from '../../responses/models/question.model'
import Answer from '../../responses/models/answer.model'
import User from '../../users/user.model'

interface Migration {
  name: string
}

// Copied from StackOverflow - only to be used for testing
export async function migrate (sequelize: Sequelize, table = 'SequelizeMeta'): Promise<void> {
  const migrations = fs.readdirSync(path.join(__dirname, '../../../migrations'))
  await sequelize.query(`CREATE TABLE IF NOT EXISTS ${table} (name VARCHAR(255) NOT NULL UNIQUE)`)
  const completedMigrations = await sequelize.query<Migration>(`SELECT * FROM ${table}`, { type: QueryTypes.SELECT })

  for (const migration of completedMigrations) {
    const index = migrations.indexOf(migration.name)
    if (index !== -1) {
      migrations.splice(index, 1)
    }
  }

  const query = sequelize.getQueryInterface().sequelize.query
  const regex = /(create_hypertable|ADD CONSTRAINT|DROP CONSTRAINT|DELETE FROM .* USING)/ // unsupported by sqlite
  sequelize.getQueryInterface().sequelize.query = async (sql: string, options: any): Promise<any> => {
    if (regex.test(sql)) {
      // console.log('Skip unsupported query: ' + sql)
      return await Promise.resolve()
    }
    return await query.call(sequelize.getQueryInterface().sequelize, sql, options)
  }

  for (const filename of migrations) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const migration = require(path.join(__dirname, '../../../migrations', filename))
    try {
      await migration.up(sequelize.getQueryInterface(), DataType)
      await sequelize.query(`INSERT INTO ${table} VALUES (:name)`, { type: QueryTypes.INSERT, replacements: { name: filename } })
    } catch (err) {
      console.error(`Failed performing migration: "${filename}"`, err)
      break
    }
  }

  sequelize.getQueryInterface().sequelize.query = query
}

const primaryFirstname = 'John'
const primaryLastname = 'John'
const primaryEmail = 'John@test.org'
const primaryGuid = 'd6509477-7270-4ead-9217-b491d46f2194'
const questionTypes = [
  { id: 1, value: 'single', title: 'Single answer' },
  { id: 2, value: 'multiple', title: 'Multiple answers' }
]
const questions = [
  { id: 1, text: 'What logging evidence did you encounter?', type_id: 2 },
  { id: 2, text: 'What actions were taken? Select all that apply', type_id: 2 },
  { id: 3, text: 'What was the scale of logging operation?', type_id: 1 },
  { id: 4, text: 'How much damage was done to the area?', type_id: 1 },
  { id: 5, text: 'What did you investigate?', type_id: 2 },
  { id: 6, text: 'What poaching evidence did you encounter? Select all that apply', type_id: 2 },
  { id: 7, text: 'What was the scale of poaching operation?', type_id: 1 }
]
const answers = [
  { id: 100, text: 'None', question_id: 1 },
  { id: 101, text: 'Cut down trees', question_id: 1 },
  { id: 102, text: 'Cleared areas', question_id: 1 },
  { id: 103, text: 'Logging equipment', question_id: 1 },
  { id: 104, text: 'Loggers at site', question_id: 1 },
  { id: 105, text: 'Illegal camps', question_id: 1 },
  { id: 106, text: 'Fired/burned areas', question_id: 1 },
  { id: 107, text: 'Evidence of poaching', question_id: 1 },
  { id: 108, text: 'Other', question_id: 1 },
  { id: 200, text: 'None', question_id: 2 },
  { id: 201, text: 'Collected evidence', question_id: 2 },
  { id: 202, text: 'Issue a warning', question_id: 2 },
  { id: 203, text: 'Confiscated equipment', question_id: 2 },
  { id: 204, text: 'Issue a fine', question_id: 2 },
  { id: 205, text: 'Arrests', question_id: 2 },
  { id: 206, text: 'Planning to come back with security enforcement', question_id: 2 },
  { id: 207, text: 'Other', question_id: 2 },
  { id: 208, text: 'Damaged machinery', question_id: 2 },
  { id: 301, text: 'None', question_id: 3 },
  { id: 302, text: 'Small', question_id: 3 },
  { id: 303, text: 'Large', question_id: 3 },
  { id: 401, text: 'No visible tree disruption found', question_id: 4 },
  { id: 402, text: 'Small number of trees cut down', question_id: 4 },
  { id: 403, text: 'Medium number of trees cut down', question_id: 4 },
  { id: 404, text: 'Large area substantially clear cut', question_id: 4 },
  { id: 501, text: 'Logging', question_id: 5 },
  { id: 502, text: 'Poaching', question_id: 5 },
  { id: 503, text: 'Other', question_id: 5 },
  { id: 601, text: 'Bullet shells / gun remains', question_id: 6 },
  { id: 602, text: 'Footprints (human)', question_id: 6 },
  { id: 603, text: 'Dog tracks', question_id: 6 },
  { id: 604, text: 'Other', question_id: 6 },
  { id: 605, text: 'None', question_id: 6 },
  { id: 701, text: 'Small (individual, informal)', question_id: 7 },
  { id: 702, text: 'Large (group, coordinated)', question_id: 7 },
  { id: 703, text: 'None', question_id: 7 }
]
export const seedValues = { primaryFirstname, primaryLastname, primaryEmail, primaryGuid, questionTypes, questions, answers }

export async function seed (): Promise<void> {
  await QuestionType.bulkCreate(questionTypes)
  await Question.bulkCreate(questions)
  await Answer.bulkCreate(answers)
  await User.create({
    firstname: primaryFirstname,
    lastname: primaryLastname,
    email: primaryEmail,
    guid: primaryGuid
  })
}

export async function truncate (models: any[] = [ResponseModel]): Promise<void> {
  if (!Array.isArray(models)) {
    models = [models]
  }
  for (const model of models) {
    await model.destroy({ where: {}, force: true })
  }
}

export function expressApp (): Express {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.user = {
      guid: primaryGuid,
      email: primaryEmail,
      firstname: primaryFirstname,
      lastname: primaryLastname
    }
    next()
  })
  return app
}

export function muteConsole (levels = ['log', 'info', 'warn', 'error']): void {
  (typeof levels === 'string' ? [levels] : levels).forEach((f) => {
    console[f] = function () {}
  })
}

export async function timeout (ms: number = 1000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export default { migrate, truncate, expressApp, muteConsole, seedValues, timeout }
