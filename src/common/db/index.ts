import config from '../../config'
import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import path from 'path'

const baseOptions: SequelizeOptions = {
  logging: false,
  models: [path.join(__dirname, '../../**/*.model.*')],
  define: {
    underscored: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    timestamps: true
  }
}

const options: SequelizeOptions = {
  ...baseOptions,
  dialect: 'postgres',
  dialectOptions: {
    ssl: config.DB_SSL_ENABLED
      ? {
          require: true,
          rejectUnauthorized: false // Ref.: https://github.com/brianc/node-postgres/issues/2009
        }
      : false
  },
  host: config.DB_HOSTNAME,
  port: config.DB_PORT,
  database: config.DB_NAME,
  username: config.DB_USER,
  password: config.DB_PASSWORD
}

const optionsTesting: SequelizeOptions = {
  ...baseOptions,
  dialect: 'sqlite'
}

export const sequelize = new Sequelize(process.env.NODE_ENV === 'test' ? optionsTesting : options)

sequelize.authenticate()
  .then(() => {
    console.log('Connection to TimescaleDB has been established successfully.')
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error)
  })

export * from './helpers'
