import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'
import { IStreamQuery } from './types'
import { getEventsCountSinceLastReport } from './service'

const router = Router()

/**
 * @swagger
 *
 * /streams:
 *   get:
 *     summary: Get list of streams
 *     tags:
 *       - streams
 *     parameters:
 *       - name: projects
 *         description: Match streams belonging to one or more projects (by id)
 *         in: query
 *         type: array
 *       - name: only_public
 *         description: Return public or private streams
 *         in: query
 *         type: boolean
 *       - name: keyword
 *         description: Match streams with name
 *         in: query
 *         type: string
 *       - name: with_events_count
 *         description: Include count of events created since last report for this stream
 *         in: query
 *         type: boolean
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
 *       - name: sort
 *         description: Order the results (comma-separated list of fields, prefix "-" for descending)
 *         in: query
 *         type: string
 *         example: name
 *         default: -updated_at
 *       - name: fields
 *         description: Customize included fields and relations
 *         in: query
 *         type: array
 *     responses:
 *       200:
 *         description: List of stream objects
 *         headers:
 *           Total-Items:
 *             schema:
 *               type: integer
 *             description: Total number of items without limit and offset.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 anyOf:
 *                 - $ref: '#/components/schemas/Stream'
 *                 - $ref: '#/components/schemas/StreamWithEventsCount'
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  const converter = new Converter(req.query, {})
  converter.convert('projects').optional().toArray()
  converter.convert('only_public').optional().toBoolean()
  converter.convert('keyword').optional().toString()
  converter.convert('with_events_count').optional().toBoolean()
  converter.convert('limit').default(100).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('sort').default('-updated_at').toString()
  converter.convert('fields').optional().toArray()
  converter.validate()
    .then(async (params: IStreamQuery) => {
      const forwardedResponse = await api.getStreams(userToken, params)
      for (const key in forwardedResponse.headers) {
        res.header(key, forwardedResponse.headers[key])
      }
      if (params.with_events_count) {
        await getEventsCountSinceLastReport(forwardedResponse.data)
      }
      res.send(forwardedResponse.data)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting streams.'))
})

export default router
