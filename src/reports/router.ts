import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
// import dayjs from 'dayjs'
// import assetDao from '../assets/dao'
// import { DeploymentResponse, UpdateStreamRequest, User } from '../types'
// import { multerFile } from '../common/multer'
// import * as api from '../common/core-api'
// import { getUserUid } from '../common/user'
// import service from './service'
import { IReportPayload, IReport } from '../types'
import { createReport } from './service'
// import Deployment from './deployment.model'

const router = Router()

router.post('/', (req: Request, res: Response, next: NextFunction): void => {
  const reportPayload = req.body as IReportPayload
  const user = (req as any).user

  createReport(reportPayload, user)
    .then((report: IReport) => {
      res.location(`/reports/${report._id as string}`).sendStatus(201)
    }).catch(error => {
      // if (error instanceof ValidationError) {
      //   res.status(400).send(error.errors.length > 0 ? error.errors.map(e => e.message).join(', ') : error.message)
      // } else {
      next(error)
      // }
    })
})

// router.post('/', (req: Request, res: Response, next: NextFunction): void => {
//   const deployment = req.body as IReportPayload
//   const user: User = { name: req.user.name, email: req.user.email }
//   // const userId = getUserUid(req.user.sub)
//   const userToken = req.headers.authorization ?? ''

//   // TODO needs validation on all fields (especially deploymentKey)

//   if (!('deploymentKey' in deployment)) {
//     console.error('deploymentKey should not be null')
//     res.status(400).send('deploymentKey should not be null')
//     return
//   }

//   if (!dayjs(deployment.deployedAt).isValid()) {
//     console.error('Invalid format: deployedAt')
//     res.status(400).send('Invalid format: deployedAt')
//     return
//   }

//   service.createDeployment(userId, userToken, user, deployment).then(data => {
//     res.location(`/deployments/${data.id}`).sendStatus(201)
//   }).catch(error => {
//     if (error instanceof ValidationError) {
//       res.status(400).send(error.errors.length > 0 ? error.errors.map(e => e.message).join(', ') : error.message)
//     } else {
//       next(error)
//     }
//   })
// })

export default router
