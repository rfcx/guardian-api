import { ReportPayload, ReportModel, UserModel } from '../types'
import { ensureUserExists } from '../users/service'
import { create } from './dao'

export const createReport = async (reportData: ReportPayload, userData: UserModel): Promise<ReportModel> => {
  const user = await ensureUserExists(userData)
  return await create({
    ...reportData,
    user: user._id,
    schemaVersion: 1
  })
}

export default { createReport }
