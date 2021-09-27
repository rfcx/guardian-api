const Umzug = require('umzug')
const { sequelize } = require('../dist/common/db')
const path = require('path')
const { Sequelize } = require('sequelize')

const umzug = new Umzug({
  migrations: {
    path: path.join(__dirname, '../migrations'),
    pattern: /\.js$/,
    params: [
      sequelize.getQueryInterface(),
      Sequelize
    ]
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize,
    tableName: 'migrations',
    schema: 'sequelize'
  }
})

;(async () => {
  await umzug.up()
  console.log('All migrations performed successfully')
})()
