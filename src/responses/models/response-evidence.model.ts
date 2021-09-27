import { Table, Column, Model, ForeignKey } from 'sequelize-typescript'
import Response from './response.model'
import Evidence from './evidence.model'

@Table({
  timestamps: false
})
export default class ResponseEvidence extends Model {
  @ForeignKey(() => Response)
  @Column
  responseId!: number

  @ForeignKey(() => Evidence)
  @Column
  evidenceId!: number
}
