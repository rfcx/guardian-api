import { Document } from 'mongoose'

export interface IUser extends Document {
  firstname: string
  lastname: string
  guid: string
  email?: string
}
