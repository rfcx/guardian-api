import { model, Schema } from 'mongoose'
import { IEventModel } from './types'

const EventSchema: Schema = new Schema({
  externalId: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  streamId: {
    type: String,
    required: true
  },
  classification: {
    type: Schema.Types.ObjectId,
    ref: 'Classification',
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  }
})

export default model<IEventModel>('Event', EventSchema)
