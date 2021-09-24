import { Table, Column, Model, ForeignKey } from 'sequelize-typescript'
import Response from './response.model'
import Action from './action.model'

@Table({
  timestamps: false
})
export default class ResponseAction extends Model {
  @ForeignKey(() => Response)
  @Column
  responseId!: number

  @ForeignKey(() => Action)
  @Column
  actionId!: number
}
