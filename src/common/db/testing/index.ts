import express from 'express'
import { connect, disconnect, truncate } from './in-memory-db'

export async function startDb (): Promise<any> {
  return await connect()
}

export async function stopDb (): Promise<any> {
  return await disconnect()
}

export async function truncateDbModels (models: any[]): Promise<any> {
  return await truncate(models)
}

const primaryUserGuid = 'abc123'
const primaryUserEmail = 'jb@astonmartin.com'
const otherUserGuid = 'def456'
const otherUserEmail = 'john@doe.com'
const anotherUserGuid = 'ghy789'
const anotherUserEmail = 'foo@bar.com'
const seedValues = { primaryUserGuid, primaryUserEmail, otherUserGuid, otherUserEmail, anotherUserGuid, anotherUserEmail }

export function expressApp (): any {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use((req, res, next) => {
    (req as any).user = { guid: primaryUserGuid, email: primaryUserEmail, firstname: 'Bill', lastname: 'Brown' }
    next()
  })
  return app
}

export function muteConsole (levels = ['log', 'info', 'warn', 'error']): void {
  (typeof levels === 'string' ? [levels] : levels).forEach((f) => {
    (console as any)[f] = function () {}
  })
}

export default {
  startDb,
  stopDb,
  truncateDbModels,
  expressApp,
  muteConsole,
  seedValues
}
