import { connect, connection, Mongoose } from 'mongoose'
import config from '../../config'

const mongoUri: string = `mongodb://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOSTNAME}:${config.DB_PORT}/${config.DB_NAME}`

connection.on('connecting', () => {
  console.log('Connecting to MongoDB')
})
connection.on('open', () => {
  console.log('Connected to MongoDB')
})
connection.on('reconnected', () => {
  console.log('Reconnected to MongoDB')
})
connection.on('disconnected', () => {
  console.error('Disconnected from MongoDB')
})
connection.on('reconnectFailed', () => {
  console.error('Reconnection failed')
})

async function main (): Promise<Mongoose> {
  return await connect(mongoUri, {
    autoIndex: false // https://mongoosejs.com/docs/connections.html#options
  })
}

main().catch(err => console.log(err))

export default connection
