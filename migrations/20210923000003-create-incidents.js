// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable('incidents', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        ref: {
          type: Sequelize.INTEGER,
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
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        closed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        first_event_id: {
          type: Sequelize.UUID,
          allowNull: true
        },
        first_response_id: {
          type: Sequelize.UUID,
          allowNull: true
        }
      }, { transaction })
      const type = queryInterface.sequelize.QueryTypes.RAW
      await queryInterface.sequelize.query('CREATE INDEX incidents_project_id_ref ON incidents (project_id, ref);', { type, transaction })
      await queryInterface.sequelize.query('CREATE INDEX incidents_stream_id_closed_at ON incidents (stream_id, closed_at);', { type, transaction })
      await queryInterface.sequelize.query('CREATE INDEX incidents_created_at ON incidents (created_at);', { type, transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('incidents')
  }
}
