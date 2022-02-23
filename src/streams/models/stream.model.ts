import { Table, Column, Model, DataType, PrimaryKey, BelongsTo } from 'sequelize-typescript'
import GuardianType from './guardian-type.model'

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

  @BelongsTo(() => GuardianType, 'guardianTypeId')
  guardianType!: GuardianType
}
