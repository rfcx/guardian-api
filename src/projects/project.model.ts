import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript'

export const DEFAULT_INCIDENT_DAYS_RANGE = 7

@Table({
  tableName: 'projects',
  timestamps: false
})
export default class Project extends Model {
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string

  @Column(DataType.INTEGER)
  incidentRangeDays!: number
}
