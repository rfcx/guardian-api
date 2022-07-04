import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import assets from './assets/router'
import responses from './responses/router'
import streams from './streams/router'
import streamDetections from './detections/stream/router'
import events from './events/router'
import clusteredEvents from './clustered-events/router'
import clusteredDetections from './clustered-detections/router'
import incidents from './incidents/router'
import projects from './projects/router'
import media from './media/router'
import './events/consumer'
import docs from './docs'
import healthCheck from './health-check/router'
import logger from './common/logging'
import { jwtCheck, parseUserData } from './common/auth'
import { errorHandler, notFoundHandler } from './common/error-handlers'
import './common/db'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/docs', docs)
app.use('/health-check', healthCheck)
app.use(jwtCheck, parseUserData)

app.use(logger)
app.use('/assets', assets)
app.use('/incidents', incidents)
app.use('/clustered-events', clusteredEvents)
app.use('/clustered-detections', clusteredDetections)
app.use('/streams', streams)
app.use('/streams', streamDetections)
app.use('/projects', projects)
app.use('/responses', responses)
app.use('/media', media)
app.use('/', events)

app.use(errorHandler)
app.use(notFoundHandler)

export default app
