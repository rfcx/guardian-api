'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('assets', {
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('assets')
  }
}
