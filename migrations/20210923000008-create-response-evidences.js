// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('response_evidences', {
      response_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      evidence_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('response_evidences')
  }
}
