import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import reports from './reports/router'
import { jwtCheck, parseUserData } from './common/auth'
import { errorHandler, notFoundHandler } from './common/error-handlers'
import './common/db'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(jwtCheck, parseUserData)

// app.use('/projects', projects)
app.use('/reports', reports)

app.use(errorHandler)
app.use(notFoundHandler)

export default app
