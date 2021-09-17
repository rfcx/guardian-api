import { DocumentType } from '@typegoose/typegoose'
import { ReportPayload } from '../types'
import { ensureUserExists } from '../users/service'
import { User } from '../users/user.model'
import ReportModel, { Report } from './report.model'

export const createReport = async (reportData: ReportPayload, userData: User): Promise<DocumentType<Report>> => {
  const user = await ensureUserExists(userData)
  return await ReportModel.create({
    ...reportData,
    user: user._id,
    schemaVersion: 1
  })
}

export default { createReport }
