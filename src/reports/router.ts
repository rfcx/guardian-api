import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import { IReportPayload, IReportModel } from '../types'
import { createReport } from './service'

const router = Router()

router.post('/', (req: Request, res: Response, next: NextFunction): void => {
  const reportPayload = req.body as IReportPayload
  const user = (req as any).user

  createReport(reportPayload, user)
    .then((report: IReportModel) => {
      res.location(`/reports/${report._id as string}`).sendStatus(201)
    }).catch(error => {
      // if (error instanceof ValidationError) {
      //   res.status(400).send(error.errors.length > 0 ? error.errors.map(e => e.message).join(', ') : error.message)
      // } else {
      next(error)
      // }
    })
})

export default router
