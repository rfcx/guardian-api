import Answer from './models/answer.model'
import Question from './models/question.model'
import User from '../users/user.model'
import Incident from '../incidents/incident.model'

export const availableIncludes = [
  {
    model: Answer,
    as: 'answers',
    attributes: ['id', 'text'],
    include: [
      {
        model: Question,
        as: 'question',
        attributes: ['id', 'text']
      }
    ]
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
