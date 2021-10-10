import Evidence from './models/evidence.model'
import Action from './models/action.model'
import User from '../users/user.model'
import Incident from '../incidents/incident.model'

export const availableIncludes = [
  {
    model: Evidence,
    as: 'evidences',
    attributes: ['title']
  },
  {
    model: Action,
    as: 'actions',
    attributes: ['title']
  },
  {
    model: User,
    as: 'createdBy',
    attributes: {
      exclude: ['id']
    }
  },
  {
    model: Incident,
    as: 'incident',
    attributes: ['id', 'ref', 'streamId', 'projectId', 'createdAt', 'closedAt']
  }
]
