import { Table, Column, Model, DataType, PrimaryKey, HasMany, BelongsTo, BelongsToMany, CreatedAt, UpdatedAt, IsIn } from 'sequelize-typescript'
import { IsInCustom } from '../../types' // see https://github.com/RobinBuschmann/sequelize-typescript/issues/866
import Evidence from './evidence.model'
import ResponseEvidence from './response-evidence.model'
import Action from './action.model'
import ResponseAction from './response-action.model'
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

  @BelongsToMany(() => Evidence, () => ResponseEvidence)
  evidences!: Evidence[]

  @(IsIn as typeof IsInCustom)([[0, 1, 2, 3]])
  @Column(DataType.INTEGER)
  loggingScale!: number

  @(IsIn as typeof IsInCustom)([[0, 1, 2, 3]])
  @Column(DataType.INTEGER)
  damageScale!: number

  @BelongsToMany(() => Action, () => ResponseAction)
  actions!: Action[]

  @HasMany(() => Asset, 'id')
  assets!: Asset[]

  @BelongsTo(() => User, 'createdById')
  user!: User

  @BelongsTo(() => Incident, 'incidentId')
  incident!: Incident

  @Column(DataType.INTEGER)
  schemaVersion!: number
}
