import type { Request, Response } from 'express'
import { Router } from 'express'
import { ReportPayload } from '../types'
import { createReport } from './service'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'
import { evidences, responseActions } from './constants'

const router = Router()

/**
 * @swagger
 *
 * /reports:
 *   post:
 *     summary: Create a report
 *     tags:
 *       - reports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/Report'
 *     responses:
 *       201:
 *         description: Created
 *         headers:
 *           Location:
 *             description: Path of the created resource (e.g. `/reports/xyz123`)
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid parameters
 */
router.post('/', (req: Request, res: Response): void => {
  const user = (req as any).user
  const converter = new Converter(req.body, {})
  converter.convert('encounteredAt').toMomentUtc()
  converter.convert('evidences').toArray().nonEmpty().isEqualToAny(Object.keys(evidences).map(k => parseInt(k)))
  converter.convert('loggingScale').toInt().isEqualToAny([0, 1, 2])
  converter.convert('damageScale').toInt().isEqualToAny([0, 1, 2, 3])
  converter.convert('responseActions').toArray().nonEmpty().isEqualToAny(Object.keys(responseActions).map(k => parseInt(k)))
  converter.convert('note').optional().toString()
  converter.convert('guardianId').toString()
  converter.validate()
    .then(async (reportPayload: ReportPayload) => {
      const report = await createReport(reportPayload, user)
      res.location(`/reports/${report._id as string}`).sendStatus(201)
    })
    .catch(httpErrorHandler(req, res, 'Failed creating report.'))
})

export default router
