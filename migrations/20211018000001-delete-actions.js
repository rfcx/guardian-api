'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable('response_actions', { transaction })
      await queryInterface.dropTable('actions', { transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('actions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false
        }
      }, { transaction })
      await queryInterface.createTable('response_actions', {
        response_id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false
        },
        action_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false
        }
      }, { transaction })
    })
  }
}
