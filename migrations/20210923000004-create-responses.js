// const { Op } = require('sequelize')
// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('responses', {
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
      }, { transaction })
      const type = queryInterface.sequelize.QueryTypes.RAW
      await queryInterface.sequelize.query('CREATE INDEX responses_investigated_at ON responses (investigated_at);', { type, transaction })
      await queryInterface.sequelize.query('CREATE INDEX responses_started_at ON responses (started_at);', { type, transaction })
      await queryInterface.sequelize.query('CREATE INDEX responses_created_by ON responses (created_by_id);', { type, transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('responses')
  }
}
