import User from './users/user.model'

declare global{
  namespace Express {
    interface Request {
      user: User['_attributes']
      auth: any
    }
    interface Response {
      responseTime: string
    }
  }
}
