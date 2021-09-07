import { connect, connection, Mongoose } from 'mongoose'

interface DBCredentials {
  DB_HOSTNAME: string
  DB_NAME: string
  DB_USER: string
  DB_PASSWORD: string
}

const { DB_HOSTNAME, DB_NAME, DB_USER, DB_PASSWORD }: DBCredentials = process.env as any

const mongoUri: string = `mongodb://${DB_HOSTNAME}/${DB_NAME}`

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
    user: DB_USER,
    pass: DB_PASSWORD,
    autoIndex: false // https://mongoosejs.com/docs/connections.html#options
  })
}

main().catch(err => console.log(err))

export default connection
