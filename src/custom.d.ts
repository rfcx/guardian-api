import { UserDao } from './types'

declare global{
  namespace Express {
    interface Request {
      user: UserDao
      auth: any
    }
  }
}
