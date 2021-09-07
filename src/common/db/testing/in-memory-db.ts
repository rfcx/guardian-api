import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../../common/user/user.model'
import Report from '../../reports/report.model'

const mongoServer = new MongoMemoryServer()

async function connect (): Promise<any> {
  const uri = await mongoServer.getUri()
  const mongooseOpts = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
  await mongoose.connect(uri, mongooseOpts)
}

async function disconnect (): Promise<any> {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}

async function truncate (models = [User, Report]): Promise<any> {
  if (!Array.isArray(models)) {
    models = [models]
  }
  for (const model of models) {
    await model.remove({})
  }
}

module.exports = {
  connect,
  disconnect,
  truncate
}
