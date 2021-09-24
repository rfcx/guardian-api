// const { Op } = require('sequelize')
// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('responses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      guardian_id: {
        type: Sequelize.STRING(12),
        allowNull: false
      },
      investigated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      logging_scale: {
        type: Sequelize.INTEGER(1),
        allowNull: false
      },
      damage_scale: {
        type: Sequelize.INTEGER(1),
        allowNull: false
      },
      created_by_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'users'
          },
          key: 'id'
        }
      },
      schema_version: {
        type: Sequelize.INTEGER(2),
        allowNull: false
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('responses')
  }
}
