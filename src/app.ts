import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import assets from './assets/router'
import responses from './responses/router'
import streams from './streams/router'
import events from './events/router'
import projects from './projects/router'
import './events/consumer'
import docs from './docs'
import logger from './common/logging'
import { jwtCheck, parseUserData } from './common/auth'
import { errorHandler, notFoundHandler } from './common/error-handlers'
import './common/db'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/docs', docs)
app.use(jwtCheck, parseUserData)

app.use(logger)
app.use('/assets', assets)
app.use('/streams', streams)
app.use('/projects', projects)
app.use('/responses', responses)
app.use('/', events)

app.use(errorHandler)
app.use(notFoundHandler)

export default app
