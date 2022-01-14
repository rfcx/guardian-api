import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript'

@Table({
  tableName: 'streams',
  timestamps: false
})
export default class Stream extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string

  @Column(DataType.STRING(12))
  projectId!: string

  @Column(DataType.DATE)
  lastEventEnd!: Date

  @Column(DataType.INTEGER)
  lastIncidentEventsCount!: number

  @Column(DataType.BOOLEAN)
  hasOpenIncident!: boolean
}
