import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { Converter, httpErrorHandler } from '@rfcx/http-utils'
import { IProjectQuery } from './types'

const router = Router()

/**
 * @swagger
 *
 * /projects:
 *   get:
 *     summary: Get list of projects
 *     tags:
 *       - projects
 *     parameters:
 *       - name: only_public
 *         description: Return public or private projects
 *         in: query
 *         type: boolean
 *       - name: keyword
 *         description: Match projects with name
 *         in: query
 *         type: string
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
 *         description: List of projects objects
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
 *                 $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''
  const converter = new Converter(req.query, {})
  converter.convert('only_public').optional().toBoolean()
  converter.convert('keyword').optional().toString()
  converter.convert('limit').default(100).toInt()
  converter.convert('offset').default(0).toInt()
  converter.convert('sort').default('-updated_at').toString()
  converter.convert('fields').optional().toArray()
  converter.validate()
    .then(async (params: IProjectQuery) => {
      const forwardedResponse = await api.getProjects(userToken, params)
      for (const key in forwardedResponse.headers) {
        res.header(key, forwardedResponse.headers[key])
      }
      res.send(forwardedResponse.data)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting projects.'))
})

export default router
