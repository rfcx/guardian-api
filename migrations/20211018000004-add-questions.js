'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('questions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      text: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
      },
      type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'question_types'
          },
          key: 'id'
        }
      },
      project_id: {
        type: Sequelize.STRING(12),
        allowNull: true,
        default: null
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('questions')
  }
}
