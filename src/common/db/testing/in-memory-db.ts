import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../../../users/user.model'
import Report from '../../../reports/report.model'

let mongod: MongoMemoryServer

export async function connect (): Promise<any> {
  if (mongod === undefined) {
    mongod = await MongoMemoryServer.create()
  }
  await mongoose.connect(mongod.getUri())
}

export async function disconnect (): Promise<any> {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  if (mongod !== undefined) {
    await mongod.stop()
  }
}

export async function truncate (models = [User, Report]): Promise<any> {
  if (!Array.isArray(models)) {
    models = [models]
  }
  for (const model of models) {
    await model.remove({})
  }
}

export default {
  connect,
  disconnect,
  truncate
}
