import { Table, Column, Model, DataType, PrimaryKey, BelongsTo } from 'sequelize-typescript'
import Classificaion from '../classifications/classification.model'
import Incident from '../incidents/incident.model'

@Table({
  tableName: 'events',
  timestamps: false
})
export default class Event extends Model {
  [x: string]: any
  @PrimaryKey
  @Column(DataType.UUID)
  id!: string

  @Column(DataType.DATE)
  start!: Date

  @Column(DataType.DATE)
  end!: Date

  @Column(DataType.STRING(12))
  streamId!: string

  @Column(DataType.STRING(12))
  projectId!: string

  @BelongsTo(() => Classificaion, 'classificationId')
  classification!: Classificaion

  @BelongsTo(() => Incident, 'incidentId')
  incident!: Incident

  @Column(DataType.DATE)
  createdAt!: Date
}
