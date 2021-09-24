// const { Op } = require('sequelize')
// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('response_actions', {
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
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('response_actions')
  }
}
