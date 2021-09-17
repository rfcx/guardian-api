import { User } from './users/user.model'

declare global{
  namespace Express {
    interface Request {
      user: User
      auth: any
    }
  }
}
