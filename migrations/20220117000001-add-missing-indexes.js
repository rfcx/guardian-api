'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { RAW } = queryInterface.sequelize.QueryTypes
      await queryInterface.sequelize.query('CREATE INDEX streams_id ON streams (id);', { type: RAW, transaction })
      await queryInterface.sequelize.query('CREATE INDEX users_id ON users (id);', { type: RAW, transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { RAW } = queryInterface.sequelize.QueryTypes
      await queryInterface.sequelize.query('DROP INDEX streams_id ON streams;', { type: RAW, transaction })
      await queryInterface.sequelize.query('DROP INDEX users_id ON users;', { type: RAW, transaction })
    })
  }
}
