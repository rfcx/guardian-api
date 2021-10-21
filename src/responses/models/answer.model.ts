import { Table, Column, Model, DataType, PrimaryKey, BelongsTo } from 'sequelize-typescript'
import Question from './question.model'

@Table({
  tableName: 'answers',
  timestamps: false
})
export default class Answer extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  id!: number

  @Column(DataType.STRING)
  text!: string

  @Column(DataType.STRING)
  picture!: string

  @BelongsTo(() => Question, 'question_id')
  question!: Question
}
