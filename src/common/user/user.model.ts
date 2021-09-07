import { model, Schema } from 'mongoose'
import { IUser } from './types'

const UserSchema: Schema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  guid: { type: String, required: true },
  email: { type: String }
})

export default model<IUser>('User', UserSchema)
