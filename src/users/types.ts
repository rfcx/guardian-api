import { Document } from 'mongoose'

export interface UserDao {
  firstname: string
  lastname: string
  guid: string
  email?: string
}

export interface UserModel extends UserDao, Document {}
