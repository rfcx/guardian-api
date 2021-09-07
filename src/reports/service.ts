import { IReportPayload, IReport, IUser } from '../types'
import { ensureUserExists } from '../common/user/service'
import { create } from './dao'

export const createReport = async (reportData: IReportPayload, userData: IUser): Promise<IReport> => {
  const user = await ensureUserExists(userData)
  return await create({
    ...reportData,
    user: user._id,
    schemaVersion: 1
  })
}

export default { createReport }
