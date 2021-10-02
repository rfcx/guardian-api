// import { Table, Column, Model, DataType, PrimaryKey, HasMany, AllowNull, CreatedAt, UpdatedAt, BelongsTo, HasOne } from 'sequelize-typescript'
// import { Table, Column, Model, DataType, PrimaryKey, HasMany, AllowNull, CreatedAt, UpdatedAt, BelongsTo } from 'sequelize-typescript'
import { Table, Column, Model, DataType, PrimaryKey, HasMany, CreatedAt, UpdatedAt, BelongsTo } from 'sequelize-typescript'
import Event from '../events/event.model'
import Response from '../responses/models/response.model'
import Classificaion from '../classifications/classification.model'

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

  @HasMany(() => Event, 'incidentId')
  events!: Event[]

  @HasMany(() => Response, 'incidentId')
  responses!: Response[]

  @BelongsTo(() => Classificaion, 'classificationId')
  classification!: Classificaion

  @BelongsTo(() => Event, 'firstEventId')
  firstEvent!: Event

  @BelongsTo(() => Response, 'firstResponseId')
  firstResponse!: Response
}
