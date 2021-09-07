import express from 'express'
import { connect, disconnect, truncate } from './db'

export async function startDb (): Promise<any> {
  return connect()
}

export async function stopDb (): Promise<any> {
  return disconnect()
}

export async function truncateDbModels (models): Promise<any> {
  return truncate(models)
}

const primaryUserGuid = 'abc123'
const primaryUserEmail = 'jb@astonmartin.com'
const otherUserGuid = 'def456'
const otherUserEmail = 'john@doe.com'
const anotherUserGuid = 'ghy789'
const anotherUserEmail = 'foo@bar.com'
const seedValues = { primaryUserGuid, primaryUserEmail, otherUserGuid, otherUserEmail, anotherUserGuid, anotherUserEmail, roleAdmin, roleMember, roleGuest }

export function expressApp (): any {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use((req, res, next) => {
    req.user = { guid: primaryUserGuid, email: primaryUserEmail, firstname: 'Bill', lastname: 'Brown' }
    next()
  })
  return app
}

export function muteConsole (levels = ['log', 'info', 'warn', 'error']): void {
  (typeof levels === 'string' ? [levels] : levels).forEach((f) => {
    console[f] = function () {}
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
