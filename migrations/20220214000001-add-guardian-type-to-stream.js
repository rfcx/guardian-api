'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { INSERT } = queryInterface.sequelize.QueryTypes
      await queryInterface.createTable('guardian_types', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false
        }
      }, { transaction })

      await queryInterface.sequelize.query("INSERT INTO guardian_types (id, title) VALUES (1, 'gsm')", { type: INSERT, transaction })
      await queryInterface.sequelize.query("INSERT INTO guardian_types (id, title) VALUES (2, 'satellite')", { type: INSERT, transaction })

      return await queryInterface.addColumn(
        'streams',
        'guardian_type_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: {
              tableName: 'guardian_types'
            },
            key: 'id'
          }
        }, {
          transaction
        }
      )
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('streams', 'guardian_type_id', { transaction })
      return await queryInterface.dropTable('guardian_types', { transaction })
    })
  }
}
