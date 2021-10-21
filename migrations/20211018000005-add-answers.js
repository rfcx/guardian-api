'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('answers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      text: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: true
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'questions'
          },
          key: 'id'
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('answers')
  }
}
