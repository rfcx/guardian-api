'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('events', {
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
        project_id: {
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
        incident_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: 'incidents'
            },
            key: 'id'
          }
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { transaction })
      const type = queryInterface.sequelize.QueryTypes.RAW
      await queryInterface.sequelize.query('SELECT create_hypertable(\'events\', \'start\')', { type, transaction })
      await queryInterface.sequelize.query('CREATE INDEX events_stream_id ON events (stream_id);', { type, transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('events')
  }
}
