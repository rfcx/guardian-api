import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { AssetPathData } from '../../types'
dayjs.extend(utc)

export function assetPath (data: AssetPathData): string {
  const timestamp = dayjs(data.createdAt)
  const year = timestamp.year()
  const month = (timestamp.month() + 1).toString().padStart(2, '0')
  const dayOfMonth = timestamp.date().toString().padStart(2, '0')
  return `${year}/${month}/${dayOfMonth}/${data.responseId}/${data.fileName}`
}

export function uniquifyFilename (originalFilename: string): string {
  const rand = cheapRandomString(8)
  return `${rand}-${originalFilename}`
}

function cheapRandomString (length: number): string {
  const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return [...Array(length)].reduce((a: string) => a + p[~~(Math.random() * p.length)], '')
}
