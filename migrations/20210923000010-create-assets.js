'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('assets', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        file_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        mime_type: {
          type: Sequelize.STRING(32),
          allowNull: false
        },
        response_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: 'responses'
            },
            key: 'id'
          }
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
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction })
      const type = queryInterface.sequelize.QueryTypes.RAW
      await queryInterface.sequelize.query('CREATE INDEX assets_response_id ON assets (response_id);', { type, transaction })
      await queryInterface.sequelize.query('CREATE INDEX assets_created_by_id ON assets (created_by_id);', { type, transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('assets')
  }
}
