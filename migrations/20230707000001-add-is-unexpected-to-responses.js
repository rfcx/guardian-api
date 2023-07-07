'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'responses',
      'is_unexpected',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('responses', 'is_unexpected')
  }
}
