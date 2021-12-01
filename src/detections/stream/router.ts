import type { Request, Response } from 'express'
import { Router } from 'express'
import { getDetections } from '../../common/core-api'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'
import { DetectionsQuery } from './types'

const router = Router()

/**
 * @swagger
 *
 * /streams/{id}/detections:
 *   get:
 *     summary: Get list of detections belonging to a stream
 *     tags:
 *       - detections
 *     parameters:
 *       - name: id
 *         description: Stream identifier
 *         in: path
 *         required: true
 *         type: string
 *       - name: start
 *         description: Start timestamp (iso8601 or epoch)
 *         in: query
 *         required: true
 *         type: string
 *       - name: end
 *         description: End timestamp (iso8601 or epoch)
 *         in: query
 *         required: true
 *         type: string
 *       - name: classifications
 *         description: List of clasification identifiers
 *         in: query
 *         type: array
 *       - name: min_confidence
 *         description: Return results above a minimum confidence (by default will return above minimum confidence of the classifier)
 *         in: query
 *         type: float
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Detection'
 *       400:
 *         description: Invalid query parameters
 *       404:
 *         description: Stream not found
 */
router.get('/:id/detections', (req: Request, res: Response): void => {
  console.log('\n\nHEREEE\n\n')
  const userToken = req.headers.authorization ?? ''
  const streamId = req.params.id
  const converter = new Converter(req.query, {})
  converter.convert('start').toMomentUtc()
  converter.convert('end').toMomentUtc()
  converter.convert('classifications').optional().toArray()
  converter.convert('min_confidence').optional().toFloat()
  converter.convert('limit').optional().toInt()
  converter.convert('offset').optional().toInt()
  converter.validate()
    .then(async (params: DetectionsQuery) => {
      const forwardedResponse = await getDetections(streamId, userToken, params)
      for (const key in forwardedResponse.headers) {
        res.header(key, forwardedResponse.headers[key])
      }
      res.send(forwardedResponse.data)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting detections.'))
})

export default router
