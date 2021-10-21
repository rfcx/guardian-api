import { Table, Column, Model, DataType, PrimaryKey, HasMany, BelongsTo, BelongsToMany, CreatedAt, UpdatedAt } from 'sequelize-typescript'
import Answer from './answer.model'
import ResponseAnswer from './response-answer.model'
import Asset from '../../assets/asset.model'
import User from '../../users/user.model'
import Incident from '../../incidents/incident.model'

@Table({
  tableName: 'responses'
})
export default class Response extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string

  @Column(DataType.STRING(12))
  streamId!: string

  @Column(DataType.STRING(12))
  projectId!: string

  @Column(DataType.DATE)
  investigatedAt!: Date

  @Column(DataType.DATE)
  startedAt!: Date

  @Column(DataType.DATE)
  submittedAt!: Date

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date

  @BelongsToMany(() => Answer, () => ResponseAnswer)
  answers!: Answer[]

  @HasMany(() => Asset, 'id')
  assets!: Asset[]

  @BelongsTo(() => User, 'createdById')
  createdBy!: User

  @BelongsTo(() => Incident, 'incidentId')
  incident!: Incident

  @Column(DataType.INTEGER)
  schemaVersion!: number
}
