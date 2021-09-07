import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
// import projects from './projects/router'
import reports from './deplo/router'
import { jwtCheck } from './common/auth'
import { errorHandler, notFoundHandler } from './common/error-handlers'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(jwtCheck)

// app.use('/projects', projects)
app.use('/reports', reports)

app.use(errorHandler)
app.use(notFoundHandler)

export default app
