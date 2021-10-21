import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript'

@Table({
  tableName: 'question_types',
  timestamps: false
})
export default class QuestionType extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Column(DataType.STRING)
  value!: string

  @Column(DataType.STRING)
  title!: string
}
