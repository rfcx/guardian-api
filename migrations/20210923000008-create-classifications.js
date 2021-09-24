'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('classifications', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        value: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        }
      }, { transaction })
      await queryInterface.sequelize.query('CREATE UNIQUE INDEX classifications_value_idx ON classifications (value);', { transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('classifications')
  }
}
