import { Table, Column, Model, ForeignKey } from 'sequelize-typescript'
import Response from './response.model'
import Answer from './answer.model'

@Table({
  timestamps: false
})
export default class ResponseAnswer extends Model {
  @ForeignKey(() => Response)
  @Column
  responseId!: number

  @ForeignKey(() => Answer)
  @Column
  answerId!: number
}
