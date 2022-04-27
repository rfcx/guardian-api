export interface AssetCreationData {
  fileName: string
  mimeType: string
  responseId: string
  createdById: number
  createdAt: Date
}

export interface AssetsFilters {
  responseId: string
}

export interface AssetPathData {
  createdAt: Date
  responseId: string
  fileName: string
}

export interface AssetFileAttributes {
  mimetype: string
  originalname: string
  buffer?: Buffer
  path?: string
  destination?: string
}
