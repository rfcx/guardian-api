import { Request, Response, Router } from 'express'
import { ResponsePayload } from '../types'
import { createResponse, getResponse, uploadFileAndSaveToDb } from './service'
import { Converter, EmptyResultError, httpErrorHandler, ValidationError } from '@rfcx/http-utils'
import { getStream } from '../common/core-api'
import { multerFile } from '../common/multer'
import { get } from './dao'
import incidentDao from '../incidents/dao'
import assetDao from '../assets/dao'

const router = Router()

/**
 * @swagger
 *
 * /responses/{id}:
 *   get:
 *     summary: Get response data
 *     tags:
 *       - responses
 *     parameters:
 *       - name: id
 *         description: Response id
 *         in: path
 *         required: true
 *         type: string
 *         example: "debf4db5-3826-4266-a0cd-d4e38aa139ba"
 *     responses:
 *       200:
 *         description: Response object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *       404:
 *         description: Response not found
 */
router.get('/:id', (req: Request, res: Response): void => {
  getResponse(req.params.id)
    .then((response) => {
      res.json(response)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting response.'))
})

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
 *             description: Path of the created resource (e.g. `/responses/897da0ed-4098-4f93-8a6f-b94c4e8c78b5`)
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incidentRef:
 *                   type: string
 *                   description: Incident reference id to which Response belongs to
 *                   example: 1
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
  converter.convert('answers').toArray()
  converter.convert('note').optional().toString()
  converter.convert('streamId').toString().isPassingRegExp(/[a-z0-9]{12}/, 'should consist of 12 lower-cased characters or digits')
  converter.validate()
    .then(async (responsePayload: ResponsePayload) => {
      const forwardedResponse = await getStream(responsePayload.streamId, idToken)
      if (forwardedResponse.data.project === null) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new ValidationError('Project id is not defined for stream')
      }
      const response = await createResponse({ ...responsePayload, projectId: forwardedResponse.data.project.id }, user)
      const incident = await incidentDao.get((response as any).incidentId)
      res.location(`/responses/${response.id}`).status(201).json({ incidentRef: (incident as any).ref })
    })
    .catch(httpErrorHandler(req, res, 'Failed creating response.'))
})

/**
 * @swagger
 *
 * /responses/{id}/assets:
 *   get:
 *     summary: Get Assets for the Response
 *     tags:
 *       - assets
 *     parameters:
 *       - name: id
 *         description: Response id
 *         in: path
 *         required: true
 *         type: string
 *         example: "debf4db5-3826-4266-a0cd-d4e38aa139ba"
 *     responses:
 *       200:
 *         description: Asset file
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Asset not found
 */
router.get('/:id/assets', (req: Request, res: Response): void => {
  const responseId = req.params.id
  get(responseId)
    .then(async response => {
      if (response === null) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new EmptyResultError('Response with given id not found')
      }
      const results = await assetDao.query({ responseId })
      res.json(results)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting response.'))
})

/**
 * @swagger
 *
 * /responses/{id}/assets:
 *   post:
 *     summary: Add Assets for the Response
 *     tags:
 *       - assets
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: id
 *         description: Response id
 *         in: path
 *         required: true
 *         type: string
 *         example: "debf4db5-3826-4266-a0cd-d4e38aa139ba"
 *       - name: file
 *         in: formData
 *         type: file
 *         description: The file to upload.
 *     responses:
 *       201:
 *         description: Created
 *         headers:
 *           Location:
 *             description: Path of the created resource (e.g. `/assets/b8c09041-1b9a-451e-b7c3-762cc64197bc`)
 *             schema:
 *               type: string
 *       404:
 *         description: Response not found
 */
router.post('/:id/assets', multerFile.single('file'), (req: Request, res: Response): void => {
  const user = (req as any).user
  const responseId = req.params.id
  const file = req.file ?? null
  get(responseId)
    .then(async response => {
      if (response === null) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new EmptyResultError('Response with given id not found')
      }
      const assetId = await uploadFileAndSaveToDb(response, file, user)
      res.location(`/assets/${assetId}`).sendStatus(201)
    })
    .catch(httpErrorHandler(req, res, 'Failed creating asset.'))
})

export default router
