// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('response_answers', {
      response_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      answer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('response_answers')
  }
}
