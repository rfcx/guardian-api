import type { Request, Response } from 'express'
import { Router } from 'express'
import { httpErrorHandler, Converter, EmptyResultError } from '@rfcx/http-utils'
import { IncidentQuery } from '../types'
import { getIncidents, getIncident } from './service'

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
  const converter = new Converter(req.query, {})
  converter.convert('streams').optional().toArray()
  converter.convert('projects').optional().toArray()
  converter.convert('closed').optional().toBoolean()
  converter.convert('limit').default(100).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('sort').default('-createdAt').toString()
  converter.validate()
    .then(async (params: IncidentQuery) => {
      const data = await getIncidents(params)
      res.header('Total-Items', data.total.toString()).json(data.results)
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
  getIncident(req.params.id)
    .then((incident) => {
      if (incident === null) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new EmptyResultError('Incident with given id not found')
      }
      res.json(incident)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting incident.'))
})

export default router