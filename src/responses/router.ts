import type { Request, Response } from 'express'
import { Router } from 'express'
import { ResponsePayload } from '../types'
import { createResponse } from './service'
import { Converter, httpErrorHandler, ValidationError } from '@rfcx/http-utils'
import { evidences, actions } from './constants'
import { getStream } from '../common/core-api'

const router = Router()

/**
 * @swagger
 *
 * /responses:
 *   post:
 *     summary: Create a response
 *     tags:
 *       - responses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/Response'
 *     responses:
 *       201:
 *         description: Created
 *         headers:
 *           Location:
 *             description: Path of the created resource (e.g. `/responses/121`)
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid parameters
 */
router.post('/', (req: Request, res: Response, next): void => {
  const user = (req as any).user
  const idToken = req.headers.authorization as string
  const converter = new Converter(req.body, {})
  converter.convert('investigatedAt').toMomentUtc()
  converter.convert('startedAt').toMomentUtc()
  converter.convert('submittedAt').toMomentUtc()
  converter.convert('evidences').toArray().nonEmpty().isEqualToAny(Object.keys(evidences).map(k => parseInt(k)))
  converter.convert('loggingScale').toInt().isEqualToAny([0, 1, 2])
  converter.convert('damageScale').toInt().isEqualToAny([0, 1, 2, 3])
  converter.convert('responseActions').toArray().nonEmpty().isEqualToAny(Object.keys(actions).map(k => parseInt(k)))
  converter.convert('note').optional().toString()
  converter.convert('streamId').toString()
  converter.validate()
    .then(async (responsePayload: ResponsePayload) => {
      const forwardedResponse = await getStream(idToken, responsePayload.streamId)
      if (forwardedResponse.data.project === null) {
        throw new ValidationError('Project id is not defined for stream')
      }
      const response = await createResponse({ ...responsePayload, projectId: forwardedResponse.data.project.id }, user)
      res.location(`/responses/${response.id}`).sendStatus(201)
    })
    .catch(httpErrorHandler(req, res, 'Failed creating response.'))
})

export default router
