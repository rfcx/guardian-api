'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      start: {
        type: Sequelize.DATE(3),
        allowNull: false,
        primaryKey: true
      },
      end: {
        type: Sequelize.DATE(3),
        allowNull: false
      },
      stream_id: {
        type: Sequelize.STRING(12),
        allowNull: false
      },
      classification_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'classifications'
          },
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    }).then(() => {
      return queryInterface.sequelize.query('SELECT create_hypertable(\'events\', \'start\')', {
        type: queryInterface.sequelize.QueryTypes.RAW
      })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('events')
  }
}
