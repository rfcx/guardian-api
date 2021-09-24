'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('evidences', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        unique: true
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('evidences')
  }
}
