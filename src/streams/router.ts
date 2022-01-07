import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'
import { StreamQuery, StreamResponseWithIncidents, StreamWithIncidentsQuery } from './types'
import { getEventsCountSinceLastReport } from '../events/service'
import { filterbyActiveStreams } from './service'
import { getIncidents } from '../incidents/service'

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
 *       - name: keyword
 *         description: Match streams with name
 *         in: query
 *         type: string
 *         example: "Temb"
 *       - name: with_events_count
 *         description: Include count of events created since last report for this stream
 *         in: query
 *         type: boolean
 *         example: true
 *       - name: active
 *         description: Return only streams which have events
 *         in: query
 *         type: boolean
 *         example: false
 *         default: false
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
  converter.convert('keyword').optional().toString()
  converter.convert('with_events_count').optional().toBoolean()
  converter.convert('active').default(false).toBoolean()
  converter.convert('limit').default(100).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('sort').default('-updated_at').toString()
  converter.convert('fields').optional().toArray()
  converter.validate()
    .then(async (params: StreamQuery) => {
      const forwardedResponse = await api.getStreams(userToken, params)
      for (const key in forwardedResponse.headers) {
        res.header(key, forwardedResponse.headers[key])
      }
      if (params.active) {
        forwardedResponse.data = await filterbyActiveStreams(forwardedResponse.data)
      }
      if (params.with_events_count) {
        await getEventsCountSinceLastReport(forwardedResponse.data)
      }
      res.send(forwardedResponse.data)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting streams.'))
})

/**
 * @swagger
 *
 * /streams/incidents:
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
 *       - name: incidents_closed
 *         description: Open or closed incidents
 *         in: query
 *         type: boolean
 *       - name: incidents_min_events
 *         description: Minimum number of events in the incident
 *         in: query
 *         type: number
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
 *         default: 10
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
router.get('/incidents', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  const converter = new Converter(req.query, {}, { camelize: true })
  converter.convert('projects').optional().toArray()
  converter.convert('keyword').optional().toString()
  converter.convert('incidents_closed').optional().toBoolean()
  converter.convert('incidents_min_events').optional().toInt().minimum(0)
  converter.convert('limit').default(10).maximum(20).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('limit_incidents').default(10).toInt()
  converter.convert('fields').optional().toArray()
  converter.validate()
    .then(async (params: StreamWithIncidentsQuery) => {
      const forwardedResponse = await api.getStreams(userToken, params)
      let streams = forwardedResponse.data
      for (const key in forwardedResponse.headers) {
        res.header(key, forwardedResponse.headers[key])
      }
      streams = await filterbyActiveStreams(streams)
      const { incidentsClosed, incidentsMinEvents, limitIncidents } = params
      for (const stream of streams) {
        const incData = await getIncidents({
          streams: [stream.id],
          closed: incidentsClosed,
          minEvents: incidentsMinEvents,
          limit: limitIncidents,
          offset: 0,
          sort: '-createdAt'
        }, userToken);
        (stream as StreamResponseWithIncidents).incidents = {
          total: incData.total,
          items: incData.results
        }
      }
      res.send(streams)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting streams.'))
})

export default router
