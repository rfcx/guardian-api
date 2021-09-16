import { model, Schema } from 'mongoose'
import { ClassificationModel } from './types'

const ClassificationSchema: Schema = new Schema({
  value: {
    type: String
  },
  title: {
    type: String
  }
})

export default model<ClassificationModel>('Classification', ClassificationSchema)
