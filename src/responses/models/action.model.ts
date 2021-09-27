import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript'

@Table({
  tableName: 'actions',
  timestamps: false
})
export default class Actions extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Column(DataType.STRING)
  title!: string
}
