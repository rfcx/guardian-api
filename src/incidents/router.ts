import type { Request, Response } from 'express'
import { Router } from 'express'
import { httpErrorHandler, Converter } from '@rfcx/http-utils'
import { IncidentQuery, IncidentPatchPayload } from '../types'
import { getIncidents, getIncident, updateIncident } from './service'

const router = Router()

/**
 * @swagger
 *
 * /incidents:
 *   get:
 *     summary: Get list of incidents
 *     tags:
 *       - incidents
 *     parameters:
 *       - name: streams
 *         description: Filter by stream ids
 *         in: query
 *         type: array
 *       - name: projects
 *         description: Filter by project ids
 *         in: query
 *         type: array
 *       - name: closed
 *         description: Open or closed incidents
 *         in: query
 *         type: boolean
 *       - name: min_events
 *         description: Minimum number of events in the incident
 *         in: query
 *         type: number
 *       - name: first_event_start
 *         description: Limit to a start date of the first event on or after (iso8601 or epoch)
 *         in: query
 *         required: true
 *         type: string
 *         example: 2020-01-01T00:00:00.000Z
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
 *         default: -createdAt
 *     responses:
 *       200:
 *         description: List of incident objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Validation error
 */
router.get('/', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization as string
  const converter = new Converter(req.query, {}, { camelize: true })
  converter.convert('streams').optional().toArray().isPassingRegExp(/[a-z0-9]{12}/, 'should consist of 12 lower-cased characters or digits')
  converter.convert('projects').optional().toArray().isPassingRegExp(/[a-z0-9]{12}/, 'should consist of 12 lower-cased characters or digits')
  converter.convert('closed').optional().toBoolean()
  converter.convert('min_events').optional().toInt().minimum(0)
  converter.convert('first_event_start').optional().toMomentUtc()
  converter.convert('limit').default(100).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('sort').default('-createdAt').toString()
  converter.validate()
    .then(async (params: IncidentQuery) => {
      // TODO: add check for streams permissions
      const data = await getIncidents(params, userToken)
      res
        .header('Access-Control-Expose-Headers', 'Total-Items')
        .header('Total-Items', data.total.toString())
        .json(data.results)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting incidents.'))
})

/**
 * @swagger
 *
 * /incidents/{id}:
 *   get:
 *     summary: Get incident data
 *     tags:
 *       - incidents
 *     parameters:
 *       - name: id
 *         description: Incident id
 *         in: path
 *         required: true
 *         type: string
 *         example: "debf4db5-3826-4266-a0cd-d4e38aa139ba"
 *     responses:
 *       200:
 *         description: Incident object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       404:
 *         description: Incident not found
 */
router.get('/:id', (req: Request, res: Response): void => {
  getIncident(req.params.id, req.headers.authorization as string)
    .then((incident) => {
      res.json(incident)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting incident.'))
})

/**
 * @swagger
 *
 * /incidents/{id}:
 *   patch:
 *     summary: Update incident data
 *     tags:
 *       - incidents
 *     parameters:
 *       - name: id
 *         description: Incident id
 *         in: path
 *         required: true
 *         type: string
 *         example: "debf4db5-3826-4266-a0cd-d4e38aa139ba"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/Incident'
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Incident not found
 */
router.patch('/:id', (req: Request, res: Response): void => {
  const user = (req as any).user
  const converter = new Converter(req.body, {})
  converter.convert('closed').optional().toBoolean()
  converter.validate()
    .then(async (params: IncidentPatchPayload) => {
      await updateIncident(req.params.id, params, user)
      res.sendStatus(200)
    })
    .catch(httpErrorHandler(req, res, 'Failed updating incident.'))
})

export default router
