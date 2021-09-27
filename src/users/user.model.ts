import { Table, Column, Model, DataType, PrimaryKey, Unique, AutoIncrement } from 'sequelize-typescript'

@Table({
  tableName: 'users',
  timestamps: false
})
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Unique
  @Column(DataType.STRING)
  guid!: string

  @Unique
  @Column(DataType.STRING)
  email!: string

  @Column(DataType.STRING)
  firstname!: string

  @Column(DataType.STRING)
  lastname!: string
}
