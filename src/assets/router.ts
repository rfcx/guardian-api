import type { Request, Response } from 'express'
import { Router } from 'express'
import { downloadAsStream } from '../common/storage'
import { remove, get } from './dao'
import { assetPath } from '../common/storage/paths'
import { httpErrorHandler, ForbiddenError, EmptyResultError } from '@rfcx/http-utils'

const router = Router()

/**
 * @swagger
 *
 * /assets/{id}:
 *   get:
 *     summary: Download an asset
 *     tags:
 *       - assets
 *     parameters:
 *       - name: id
 *         description: Asset id
 *         in: path
 *         required: true
 *         type: string
 *         example: "b8c09041-1b9a-451e-b7c3-762cc64197bc"
 *     responses:
 *       200:
 *         description: Asset file
 *       404:
 *         description: Asset not found
 */
router.get('/:id', (req: Request, res: Response): void => {
  const id = req.params.id.split('.')[0] // in case we request it with extension
  get(id)
    .then(asset => {
      if (asset === null) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new EmptyResultError('Asset not found')
      } else {
        res.header('Content-Type', asset.mimeType)
        const path = assetPath({ createdAt: asset.createdAt, responseId: asset.response.id, fileName: asset.fileName })
        downloadAsStream(path).pipe(res)
      }
    })
    .catch(httpErrorHandler(req, res, 'Failed deleting asset.'))
})

/**
 * @swagger
 *
 * /assets/{id}:
 *   delete:
 *     summary: Detete an asset
 *     tags:
 *       - assets
 *     parameters:
 *       - name: id
 *         description: Asset id
 *         in: path
 *         required: true
 *         type: string
 *         example: "b8c09041-1b9a-451e-b7c3-762cc64197bc"
 *     responses:
 *       204:
 *         description: Deleted
 *       403:
 *         description: Insufficient privileges
 *       404:
 *         description: Asset not found
 */
router.delete('/:id', (req: Request, res: Response): void => {
  const userData = (req as any).user
  get(req.params.id)
    .then(async (asset) => {
      if (asset === null) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new EmptyResultError('Asset not found')
      }
      if (asset.createdBy.email !== userData.email && asset.createdBy.guid !== userData.guid) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new ForbiddenError('You are not allowed to delete this asset')
      }
      await remove(req.params.id)
      res.status(204).send()
    })
    .catch(httpErrorHandler(req, res, 'Failed deleting asset.'))
})

export default router
