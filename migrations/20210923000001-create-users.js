'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      guid: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users')
  }
}
