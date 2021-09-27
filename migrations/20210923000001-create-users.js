'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        guid: {
          type: Sequelize.UUID,
          unique: true,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          unique: true
        },
        firstname: {
          type: Sequelize.STRING
        },
        lastname: {
          type: Sequelize.STRING
        }
      }, { transaction })
      const type = queryInterface.sequelize.QueryTypes.RAW
      await queryInterface.sequelize.query('CREATE INDEX users_email ON users (email);', { type, transaction })
      await queryInterface.sequelize.query('CREATE INDEX users_guid ON users (guid);', { type, transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users')
  }
}
