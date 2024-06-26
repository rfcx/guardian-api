import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { httpErrorHandler } from '@rfcx/http-utils'

const router = Router()

/**
 * @swagger
 *
 * /clustered-detections:
 *   get:
 *     summary: Get detections as clusters based on an aggregate function
 *     description: Perform detection search across streams and classifications
 *     tags:
 *       - detections
 *     parameters:
 *       - name: interval
 *         description: Time interval for aggregate results. Supported intervals `d` (day), `h` (hour), `m` (minute), `s` (second).
 *         in: query
 *         schema:
 *           type: string
 *         default: 1d
 *         examples:
 *           days:
 *             value: 1d
 *           hours:
 *             value: 3h
 *           minutes:
 *             value: 15m
 *           seconds:
 *             value: 90s
 *       - name: aggregate
 *         description: Aggregate function to apply. Supported functions `avg`, `count`, `min`, `max`, `sum`.
 *         in: query
 *         schema:
 *           type: string
 *         default: count
 *       - name: field
 *         description: Column or field to apply the function.
 *         schema:
 *           type: string
 *         default: start
 *       - name: start
 *         description: Limit to a start date on or after (iso8601 or epoch)
 *         in: query
 *         required: true
 *         type: string
 *       - name: end
 *         description: Limit to a start date before (iso8601 or epoch)
 *         in: query
 *         required: true
 *         type: string
 *       - name: streams
 *         description: List of stream ids to limit results
 *         in: query
 *         type: array|string
 *         example: xu82jDgX49
 *         required: true
 *       - name: classifications
 *         description: Limit results to classification values
 *         in: query
 *         type: array|string
 *         example: porosus
 *       - name: descending
 *         description: Order by descending time (most recent first)
 *         in: query
 *         type: boolean
 *         default: false
 *         example: true
 *       - name: limit
 *         description: Maximum number of results to return
 *         in: query
 *         type: int
 *         default: 100
 *       - name: offset
 *         description: Number of results to skip
 *         in: query
 *         type: int
 *         default: 0
 *     responses:
 *       200:
 *         description: List of cluster detection (lite) objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetectionCluster'
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  api.getClusteredDetections(userToken, req.query)
    .then((forwardedResponse) => {
      for (const key in forwardedResponse.headers) {
        res.header(key, forwardedResponse.headers[key])
      }
      res.send(forwardedResponse.data)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting clustered detections.'))
})

export default router
