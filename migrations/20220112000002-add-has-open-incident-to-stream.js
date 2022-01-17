'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { SELECT, UPDATE } = queryInterface.sequelize.QueryTypes
      await queryInterface.addColumn(
        'streams',
        'has_open_incident',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }, {
          transaction
        }
      )

      const streams = await queryInterface.sequelize.query(`
        SELECT stream_id, COUNT(id) as count FROM incidents WHERE closed_at IS NULL GROUP BY stream_id;`, {
        type: SELECT,
        raw: true,
        transaction
      })
      if (streams.length) {
        await queryInterface.sequelize.query('UPDATE streams SET has_open_incident = true WHERE id IN (:ids);', {
          type: UPDATE,
          raw: true,
          replacements: {
            ids: streams.map(s => s.stream_id)
          },
          transaction
        })
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('streams', 'has_open_incident')
  }
}
