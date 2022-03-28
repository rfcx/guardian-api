import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'
import { StreamWithIncidentsQuery } from './types'
import { preprocessByActiveStreams, fillGuardianType, filterStreamType } from './service'
import { getIncidents } from '../incidents/service'

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
 *       - name: type
 *         description: Filter streams by 'guardian' and 'stream' type
 *         in: query
 *         type: string
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
 *                 $ref: '#/components/schemas/StreamWithIncidents'
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  const converter = new Converter(req.query, {}, { camelize: true })
  converter.convert('projects').optional().toArray().isPassingRegExp(/[a-z0-9]{12}/, 'should consist of 12 lower-cased characters or digits')
  converter.convert('keyword').optional().toString()
  converter.convert('has_new_events').optional().toBoolean()
  converter.convert('has_hot_incident').optional().toBoolean()
  converter.convert('type').optional().toString()
  converter.convert('include_closed_incidents').default(false).toBoolean()
  converter.convert('limit').default(10).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('limit_incidents').default(0).toInt()
  converter.convert('fields').optional().toArray()
  converter.validate()
    .then(async (params: StreamWithIncidentsQuery) => {
      // get all accessible streams from the Core API
      const forwardedResponse = await api.getStreams(userToken, {
        ...params,
        limit: 10000000000, // Core API has default limit of 100 items, so we need to overwrite it
        offset: 0
      })
      let { total, items } = await preprocessByActiveStreams(forwardedResponse.data, params)
      await fillGuardianType(items)
      if (params.type !== undefined) {
        items = filterStreamType(items, params.type)
      }
      const { limitIncidents, includeClosedIncidents } = params
      if (limitIncidents > 0) {
        for (const stream of items) {
          const incData = await getIncidents({
            streams: [stream.id],
            closed: includeClosedIncidents ? undefined : false,
            limit: limitIncidents,
            offset: 0,
            sort: '-createdAt'
          }, userToken);
          (stream as any).incidents = {
            total: incData.total,
            items: incData.results
          }
        }
      }
      res.set({ 'Access-Control-Expose-Headers': 'Total-Items', 'Total-Items': total }).send(items)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting streams.'))
})

/**
 * @swagger
 *
 * /streams/{id}:
 *   get:
 *     summary: Get stream data
 *     tags:
 *       - streams
 *     parameters:
 *       - name: id
 *         description: Stream id
 *         in: path
 *         required: true
 *         type: string
 *         example: "uiq4kotjok6i"
 *     responses:
 *       200:
 *         description: Stream object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StreamWithTagsAndGuardianType'
 *       404:
 *         description: Stream not found
 */
router.get('/:id', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  api.getStream(req.params.id, userToken)
    .then(async (streamResponse) => {
      let stream = streamResponse.data
      const { items } = await preprocessByActiveStreams([stream])
      stream = items[0]
      await fillGuardianType(stream)
      res.json(stream)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting Stream.'))
})

export default router
