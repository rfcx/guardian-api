import { Table, Column, Model, DataType, PrimaryKey, BelongsTo } from 'sequelize-typescript'
import Classificaion from '../classifications/classification.model'

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

  @BelongsTo(() => Classificaion, 'classificationId')
  classification!: Classificaion

  @Column(DataType.DATE)
  createdAt!: Date
}
