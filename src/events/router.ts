import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { httpErrorHandler } from '@rfcx/http-utils'
import { getEventsSinceLastReport } from '../events/service'

const router = Router()

/**
 * @swagger
 *
 * /streams/{id}/last-events:
 *   get:
 *     summary: Get list of events for stream since last report
 *     tags:
 *       - events
 *     responses:
 *       200:
 *         description: List of event objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventWithIncident'
 *       403:
 *         description: Insufficient privileges
 *       404:
 *         description: Stream not found
 */
router.get('/streams/:id/last-events', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  api.getStream(req.params.id, userToken)
    .then(async (forwardedResponse) => {
      const stream = forwardedResponse.data
      const events = await getEventsSinceLastReport(stream.id)
      res.send(events)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting stream events.') as any)
})

export default router
