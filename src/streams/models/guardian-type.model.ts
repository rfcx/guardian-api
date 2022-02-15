import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript'

@Table({
  tableName: 'guardian_types',
  timestamps: false
})
export default class GuardianType extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Column(DataType.STRING)
  title!: string
}
