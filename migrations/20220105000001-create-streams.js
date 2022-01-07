// 'use strict'
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { RAW, SELECT } = queryInterface.sequelize.QueryTypes
      await queryInterface.createTable('streams', {
        id: {
          type: Sequelize.STRING(12),
          allowNull: false,
          primaryKey: true
        },
        project_id: {
          type: Sequelize.STRING(12),
          allowNull: false
        },
        last_event_end: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction })
      await queryInterface.sequelize.query('CREATE INDEX streams_last_event_end ON streams (last_event_end);', { type: RAW, transaction })
      await queryInterface.sequelize.query('CREATE INDEX streams_project_id ON streams (project_id);', { type: RAW, transaction })

      // get distinct `stream_id` from `incidents` table, then find latest `start` value for each of them from `events` table
      const streamTimes = await queryInterface.sequelize.query(`
        SELECT ev.stream_id, ev.project_id, ev.id, ev."end" FROM events ev
        INNER JOIN
          (SELECT stream_id, max("end") as max_end FROM events GROUP BY stream_id) ev2
          ON ev.stream_id = ev2.stream_id AND ev."end" = ev2.max_end
        WHERE ev.stream_id IN
          (SELECT DISTINCT stream_id FROM incidents);`, {
        type: SELECT,
        raw: true,
        transaction
      })
      if (streamTimes.length) {
        await queryInterface.sequelize.query(`INSERT INTO streams (id, project_id, last_event_end) VALUES ${streamTimes.map((i) => `('${i.stream_id}', '${i.project_id}', '${dayjs.utc(i.end).toISOString()}')`).join(', ')}`, {
          type: queryInterface.sequelize.QueryTypes.INSERT,
          transaction
        })
      }

      const fkBase = {
        fields: ['stream_id'],
        type: 'FOREIGN KEY',
        references: {
          table: 'streams',
          field: 'id'
        },
        onDelete: 'no action',
        onUpdate: 'no action',
        transaction
      }
      await queryInterface.addConstraint('incidents', { ...fkBase, name: 'fk_incidents_stream_id' })
      await queryInterface.addConstraint('events', { ...fkBase, name: 'fk_events_stream_id' })
      await queryInterface.addConstraint('responses', { ...fkBase, name: 'fk_responses_stream_id' })
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeConstraint('incidents', 'fk_incidents_stream_id', { transaction })
      await queryInterface.removeConstraint('events', 'fk_events_stream_id', { transaction })
      await queryInterface.removeConstraint('responses', 'fk_responses_stream_id', { transaction })
      await queryInterface.dropTable('streams', { transaction })
    })
  }
}
