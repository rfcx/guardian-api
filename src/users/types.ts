import { Document } from 'mongoose'

export interface IUser {
  firstname: string
  lastname: string
  guid: string
  email?: string
}

export interface IUserModel extends IUser, Document {}
