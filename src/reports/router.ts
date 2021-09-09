import type { Request, Response } from 'express'
import { Router } from 'express'
import { IReportPayload, IReportModel } from '../types'
import { createReport } from './service'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'

const router = Router()

router.post('/', (req: Request, res: Response): void => {
  const user = (req as any).user
  const converter = new Converter(req.body, {})
  converter.convert('encounteredAt').toMomentUtc()
  converter.convert('isLoggerEncountered').toBoolean()
  converter.convert('isEvidenceEncountered').toBoolean()
  converter.convert('evidences').toArray()
  converter.convert('loggingScale').toNonNegativeInt()
  converter.convert('responseActions').toArray()
  converter.convert('note').toString()
  converter.convert('guardianId').toString()
  converter.validate()
    .then(async (reportPayload: IReportPayload) => {
      const report: IReportModel = await createReport(reportPayload, user)
      res.location(`/reports/${report._id as string}`).sendStatus(201)
    })
    .catch(httpErrorHandler(req, res, 'Failed creating report.'))
})

export default router
