import type { Request, Response } from 'express'
import { Router } from 'express'
import * as api from '../common/core-api'
import { httpErrorHandler } from '@rfcx/http-utils'

const router = Router()

/**
 * @swagger
 *
 * /media/{filename}:
 *   get:
 *     summary: Generate stream asset file (audio or spectrogram)
 *     tags:
 *       - media
 *     parameters:
 *       - name: filename
 *         description: check out <a href="https://media-api.rfcx.org/docs/#/internal/get_internal_assets_streams__filename_" target="_blank">Media API docs</a> for full explanation
 *         in: query
 *         type: string
 *         required: true
 *         example: ij4yexu6o52d_t20191227T134400000Z.20191227T134420000Z_rfull_g1_fspec_d600.512_wdolph_z120.png
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Insufficient privileges
 *       404:
 *         description: Not found
 */

router.get('/:filename', (req: Request, res: Response): void => {
  const userToken = req.headers.authorization ?? ''

  api.getMedia(req.params.filename, userToken)
    .then((forwardedResponse) => {
      forwardedResponse.data.pipe(res)
    })
    .catch(httpErrorHandler(req, res, 'Failed getting file.'))
})

export default router
