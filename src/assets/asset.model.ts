import { Table, Column, Model, DataType, CreatedAt, BelongsTo, UpdatedAt, DeletedAt } from 'sequelize-typescript'
import Response from '../responses/models/response.model'
import User from '../users/user.model'

@Table({
  tableName: 'assets',
  paranoid: true
})
export default class Asset extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string

  @Column(DataType.STRING(255))
  fileName!: string

  @Column(DataType.STRING(32))
  mimeType!: string

  @BelongsTo(() => Response, 'responseId')
  response!: Response

  @BelongsTo(() => User, 'createdById')
  createdBy!: User

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date

  @DeletedAt
  deletedAt!: Date
}
