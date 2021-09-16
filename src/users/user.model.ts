import { model, Schema } from 'mongoose'
import { UserModel } from './types'

const UserSchema: Schema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  guid: { type: String, required: true },
  email: { type: String }
})

export default model<UserModel>('User', UserSchema)
