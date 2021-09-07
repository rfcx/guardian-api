import { IUser } from '../../types/index'

declare namespace Express {
  export interface Request {
    user: IUser
  }
}
