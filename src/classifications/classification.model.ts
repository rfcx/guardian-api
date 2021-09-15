import { model, Schema } from 'mongoose'
import { IClassificationModel } from './types'

const ClassificationSchema: Schema = new Schema({
  value: {
    type: String
  },
  title: {
    type: String
  }
})

export default model<IClassificationModel>('Classification', ClassificationSchema)
