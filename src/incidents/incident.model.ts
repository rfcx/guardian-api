import { Table, Column, Model, DataType, PrimaryKey, HasMany, AllowNull, CreatedAt, UpdatedAt } from 'sequelize-typescript'
import Event from '../events/event.model'
import Response from '../responses/models/response.model'

@Table({
  tableName: 'incidents'
})
export default class Incident extends Model {
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
  closedAt!: Date

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date

  @HasMany(() => Event, 'id')
  events!: Event[]

  @HasMany(() => Response, 'id')
  responses!: Response[]

  @AllowNull
  @Column(DataType.UUID)
  firstEventId!: string

  @AllowNull
  @Column(DataType.UUID)
  firstResponseId!: string
}
