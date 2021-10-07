import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Asset from '../../assets/asset.model'
dayjs.extend(utc)

export function assetPath (asset: Asset): string {
  const timestamp = dayjs(asset.createdAt)
  const year = timestamp.year()
  const month = (timestamp.month() + 1).toString().padStart(2, '0')
  const dayOfMonth = timestamp.date().toString().padStart(2, '0')
  return `${year}/${month}/${dayOfMonth}/${(asset as any).responseId as string}/${asset.fileName}`
}

export function generateFilename (originalFilename: string): string {
  const rand = cheapRandomString(8)
  return `${rand}-${originalFilename}`
}

function cheapRandomString (length: number): string {
  const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return [...Array(length)].reduce((a: string) => a + p[~~(Math.random() * p.length)], '')
}
