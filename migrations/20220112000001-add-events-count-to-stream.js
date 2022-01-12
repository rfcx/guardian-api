'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { SELECT, UPDATE } = queryInterface.sequelize.QueryTypes
      await queryInterface.addColumn(
        'streams',
        'last_incident_events_count',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }, {
          transaction
        }
      )

      const streams = await queryInterface.sequelize.query(`
        SELECT inc.stream_id, inc.id, COUNT(ev.id) FROM incidents inc
        INNER JOIN
          (SELECT stream_id, max("created_at") as max_created_at FROM incidents GROUP BY stream_id) inc2
          ON inc.stream_id = inc2.stream_id AND inc.created_at = inc2.max_created_at
        LEFT JOIN events ev ON ev.incident_id = inc.id
        WHERE inc.stream_id IN
          (SELECT DISTINCT stream_id FROM incidents)
        GROUP BY inc.stream_id, inc.id;`, {
        type: SELECT,
        raw: true,
        transaction
      })
      for (const stream of streams) {
        await queryInterface.sequelize.query(`UPDATE streams SET last_incident_events_count = ${stream.count} WHERE id = '${stream.stream_id}';`, {
          type: UPDATE,
          transaction
        })
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('streams', 'last_incident_events_count')
  }
}
