import { model, Schema } from 'mongoose'
import { IReport } from './types'

const ReportSchema: Schema = new Schema({
  guardianId: {
    type: String
  },
  encounteredAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isLoggerEncountered: Boolean,
  isEvidenceEncountered: Boolean,
  evidences: [{
    type: String
  }],
  loggingScale: {
    type: Number,
    enum: [0, 1, 2]
  },
  responseActions: [{
    type: String
  }],
  attachments: [{
    type: Schema.Types.Mixed
  }],
  note: {
    type: String
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schemaVersion: {
    type: Number
  }
})

export default model<IReport>('Report', ReportSchema)
