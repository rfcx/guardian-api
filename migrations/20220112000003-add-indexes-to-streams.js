'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { RAW } = queryInterface.sequelize.QueryTypes
      await queryInterface.sequelize.query('CREATE INDEX streams_last_incident_events_count ON streams (last_incident_events_count);', { type: RAW, transaction })
      await queryInterface.sequelize.query('CREATE INDEX streams_has_open_incident ON streams (has_open_incident);', { type: RAW, transaction })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { RAW } = queryInterface.sequelize.QueryTypes
      await queryInterface.sequelize.query('DROP INDEX streams_last_incident_events_count ON streams;', { type: RAW, transaction })
      await queryInterface.sequelize.query('DROP INDEX streams_has_open_incident ON streams;', { type: RAW, transaction })
    })
  }
}
