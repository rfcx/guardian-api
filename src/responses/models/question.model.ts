import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, HasMany, BelongsTo } from 'sequelize-typescript'
import QuestionType from './question-type.model'
import Answer from './answer.model'

@Table({
  tableName: 'questions',
  timestamps: false
})
export default class Question extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @Column(DataType.STRING)
  text!: string

  @BelongsTo(() => QuestionType, 'type_id')
  type!: QuestionType

  @Column(DataType.STRING(12))
  projectId!: string

  @HasMany(() => Answer, 'id')
  answers!: Answer[]
}
