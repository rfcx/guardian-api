import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript'

@Table({
  tableName: 'evidences',
  timestamps: false
})
export default class Evidence extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Column(DataType.STRING)
  title!: string
}
