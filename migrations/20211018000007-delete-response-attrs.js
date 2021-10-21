// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('responses', 'logging_scale')
      await queryInterface.removeColumn('responses', 'damage_scale')
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'responses',
        'logging_scale',
        {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        { transaction }
      )
      await queryInterface.addColumn(
        'responses',
        'damage_scale',
        {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        { transaction }
      )
    })
  }
}
