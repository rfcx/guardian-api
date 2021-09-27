import { Table, Column, Model, DataType, PrimaryKey, Unique, AutoIncrement } from 'sequelize-typescript'

@Table({
  tableName: 'classifications',
  timestamps: false
})
export default class Classification extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Unique
  @Column(DataType.STRING)
  value!: string

  @Column(DataType.STRING)
  title!: string
}
