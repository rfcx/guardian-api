import { Table, Column, Model, DataType, CreatedAt, BelongsTo, UpdatedAt } from 'sequelize-typescript'
import Response from '../responses/models/response.model'

@Table({
  tableName: 'assets'
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

  @BelongsTo(() => Response, 'response_id')
  response!: Response

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date
}
