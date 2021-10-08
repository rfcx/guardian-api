import { Op, col } from 'sequelize'
import User from '../users/user.model'
import Event from '../events/event.model'
import Classification from '../classifications/classification.model'
import Response from '../responses/models/response.model'

export const availableIncludes = [
  {
    model: Event,
    as: 'events',
    attributes: {
      exclude: ['incidentId', 'classificationId', 'streamId', 'projectId']
    },
    include: [{
      model: Classification,
      attributes: {
        exclude: ['id']
      }
    }]
  },
  {
    model: Event,
    as: 'firstEvent',
    attributes: {
      exclude: ['incidentId', 'classificationId', 'streamId', 'projectId']
    },
    on: {
      id: { [Op.eq]: col('Incident.first_event_id') }
    },
    include: [{
      model: Classification,
      attributes: {
        exclude: ['id']
      }
    }]
  },
  {
    model: Response,
    as: 'responses',
    attributes: ['id', 'investigatedAt', 'startedAt', 'submittedAt', 'createdAt'],
    include: [{
      model: User,
      attributes: {
        exclude: ['id']
      }
    }]
  },
  {
    model: Response,
    as: 'firstResponse',
    attributes: ['id', 'investigatedAt', 'startedAt', 'submittedAt', 'createdAt'],
    on: {
      id: { [Op.eq]: col('Incident.first_response_id') }
    },
    include: [{
      model: User,
      attributes: {
        exclude: ['id']
      }
    }]
  }
]
