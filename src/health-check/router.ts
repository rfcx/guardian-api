import type { Request, Response } from 'express'
import { Router } from 'express'
import { getResponseTime } from '../common/db'
// import * as api from '../common/core-api'
// import { Converter, httpErrorHandler } from '@rfcx/http-utils'
// import { ProjectQuery } from './types'

const router = Router()

/**
 * @swagger
 *
 * /health-check:
 *   get:
 *     summary: Get a system health check
 *     tags:
 *       - misc
 *     security: []
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 healthy:
 *                   type: boolean
 *                   example: true
 *                 time:
 *                   type: number
 *                   example: 83
 */
router.get('/', (req: Request, res: Response): void => {
  getResponseTime()
    .then((time) => {
      res.send({
        healthy: true,
        time
      })
    })
    .catch(() => {
      res.send({ healthy: false })
    })
})

export default router
