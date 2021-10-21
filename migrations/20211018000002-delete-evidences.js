'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.dropTable('response_evidences', { transaction })
      await queryInterface.dropTable('evidences', { transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('evidences', {
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
      await queryInterface.createTable('response_evidences', {
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
      }, { transaction })
    })
  }
}
