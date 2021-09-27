import type { Request, Response, NextFunction } from 'express'
import { QueryTypes } from 'sequelize'
import { Sequelize, DataType } from 'sequelize-typescript'
import * as fs from 'fs'
import * as path from 'path'
import express, { Express } from 'express'
import ResponseModel from '../../responses/models/response.model'
import Evidence from '../../responses/models/evidence.model'
import Action from '../../responses/models/action.model'
import { evidences, actions } from '../../responses/constants'

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
  const regex = /(create_hypertable|INDEX|ADD CONSTRAINT|DROP CONSTRAINT|DELETE FROM .* USING)/ // unsupported by sqlite
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
export const seedValues = { primaryFirstname, primaryLastname, primaryEmail, primaryGuid }

export async function seed (): Promise<void> {
  await Evidence.bulkCreate(Object.keys(evidences).map((k) => {
    return { id: parseInt(k), title: evidences[k] }
  }))
  await Action.bulkCreate(Object.keys(actions).map((a) => {
    return { id: parseInt(a), title: actions[a] }
  }))
}

export async function truncate (models: [any] = [ResponseModel]): Promise<void> {
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

export default { migrate, truncate, expressApp, muteConsole, seedValues }
