// 'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const { SELECT, INSERT } = queryInterface.sequelize.QueryTypes
      await queryInterface.createTable('projects', {
        id: {
          type: Sequelize.STRING(12),
          allowNull: false,
          primaryKey: true
        },
        incident_range_days: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 7
        }
      }, { transaction })
      const projects = await queryInterface.sequelize.query('SELECT DISTINCT project_id FROM incidents;', {
        type: SELECT,
        raw: true,
        transaction
      })
      if (projects.length) {
        await queryInterface.sequelize.query(`INSERT INTO projects (id) VALUES ${projects.map((p) => `('${p.project_id}')`).join(', ')}`, {
          type: INSERT,
          transaction
        })
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('projects')
  }
}
