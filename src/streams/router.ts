import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'
import { StreamResponseWithIncidents, StreamWithIncidentsQuery } from './types'
import { filterbyActiveStreams } from './service'
import { getIncidents } from '../incidents/service'
import { limitAndOffset } from '../common/page'

const router = Router()

/**
 * @swagger
 *
 * /streams:
 *   get:
 *     summary: Get list of streams with incidents
 *     tags:
 *       - streams
 *     parameters:
 *       - name: projects
 *         description: Match streams belonging to one or more projects (by id)
 *         in: query
 *         type: array
 *       - name: keyword
 *         description: Match streams with name
 *         in: query
 *         type: string
 *         example: "Temb"
 *       - name: has_new_events
 *         description: Stream has incident which has event in the last 6 hours
 *         in: query
 *         type: boolean
 *       - name: has_hot_incident
 *         description: Stream has incident which has more than 10 events
 *         in: query
 *         type: boolean
 *       - name: include_closed_incidents
 *         description: Include closed incidents into list of incidents. Also include streams which have only closed incidents.
 *         in: query
 *         type: boolean
 *       - name: limit
 *         description: Maximum number of streams to return
 *         in: query
 *         type: int
 *         default: 10
 *         maximum: 20
 *       - name: offset
 *         description: Number of streams to skip
 *         in: query
 *         type: int
 *         default: 0
 *       - name: limit_incidents
 *         description: Maximum number of incidents to return per each stream
 *         in: query
 *         type: int
 *         default: 0
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
 *                 - $ref: '#/components/schemas/StreamsWithIncidents'
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  const converter = new Converter(req.query, {}, { camelize: true })
  converter.convert('projects').optional().toArray()
  converter.convert('keyword').optional().toString()
  converter.convert('has_new_events').optional().toBoolean()
  converter.convert('has_hot_incident').optional().toBoolean()
  converter.convert('include_closed_incidents').default(false).toBoolean()
  converter.convert('limit').default(10).maximum(20).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('limit_incidents').default(0).toInt()
  converter.convert('fields').optional().toArray()
  converter.validate()
    .then(async (params: StreamWithIncidentsQuery) => {
      // get all accessible streams from the Core API
      const forwardedResponse = await api.getStreams(userToken, {
        ...params,
        limit: undefined,
        offset: undefined
      })
      let streams = forwardedResponse.data as StreamResponseWithIncidents[]
      streams = await filterbyActiveStreams(streams, params) as StreamResponseWithIncidents[]
      const total = streams.length
      streams = limitAndOffset(streams, params.limit, params.offset)
      const { limitIncidents, includeClosedIncidents } = params
      if (limitIncidents > 0) {
        for (const stream of streams) {
          const incData = await getIncidents({
            streams: [stream.id],
            closed: includeClosedIncidents ? undefined : false,
            limit: limitIncidents,
            offset: 0,
            sort: '-createdAt'
          }, userToken)
          stream.incidents = {
            total: incData.total,
            items: incData.results
          }
        }
      }
      res.set({ 'Total-Items': total }).send(streams)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting streams.'))
})

export default router
