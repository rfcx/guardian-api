import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { DeleteResult } from 'mongodb'
import { IEvent, IEventModel } from '../types'
import Event from './event.model'

dayjs.extend(utc)

export async function get (id: string): Promise<IEventModel | null> {
  return await Event.findById(id)
}

export async function getByExternalId (externalId: IEventModel['externalId']): Promise<IEventModel | null> {
  return await Event.findOne({ externalId })
}

export async function create (data: IEvent): Promise<IEventModel> {
  console.log('\n\n\ncreate', data, '\n\n\n')
  return await Event.create(data)
}

export async function deleteOne (id: IEventModel['_id']): Promise<DeleteResult> {
  return await Event.deleteOne({ _id: id })
}

export default { get, getByExternalId, create, deleteOne }
