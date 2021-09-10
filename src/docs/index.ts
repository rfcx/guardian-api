import type { Request, Response, NextFunction } from 'express'
import swaggerUi, { SwaggerOptions, SwaggerUiOptions } from 'swagger-ui-express'

import swaggerJSDoc from 'swagger-jsdoc'
import { Router } from 'express'
import modelSchemas from './modelSchemas.json'
import requestBodies from './requestBodies.json'

const router = Router()

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RFCx Ranger API Documentation',
      version: '0.0.1'
    },
    servers: [
      {
        url: 'https://staging-ranger-api.rfcx.org',
        description: 'Staging server'
      },
      {
        url: 'https://ranger-api.rfcx.org',
        description: 'Production server (live data - use with care)'
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development'
      }
    ],
    components: {
      schemas: modelSchemas,
      requestBodies: requestBodies,
      securitySchemes: {
        auth0: {
          type: 'oauth2',
          description: 'This API uses OAuth 2 with the implicit grant flow.',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://auth.rfcx.org/authorize',
              tokenUrl: 'https://auth.rfcx.org/oauth/token',
              scopes: {
                openid: 'required',
                email: 'required',
                profile: 'required',
                offline: 'required'
              }
            }
          },
          'x-tokenName': 'id_token'
        }
      }
    },
    security: [
      {
        auth0: ['openid', 'email', 'profile', 'offline']
      }
    ]
  },
  apis: [
    './src/reports/router.ts'
  ]
}

const swaggerSpec: swaggerUi.JsonObject = swaggerJSDoc(options)
const swaggerUiOptions: SwaggerOptions = {
  oauth2RedirectUrl: 'https://dev-ranger-rfcx.org/docs/auth-callback',
  operationsSorter: 'alpha'
}
const swaggerUiExpressOptions: SwaggerUiOptions = {
  customSiteTitle: 'RFCx Ranger API Documentation',
  customCss: '.topbar { display: none }',
  swaggerOptions: swaggerUiOptions
}

router.get('/auth-callback', (req: Request, res: Response) => res.sendFile('./src/docs/oauth-redirect.html', { root: '.' }))
router.use('/', swaggerUi.serve, (req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host')
  if (host != null) {
    const oauth2RedirectUrl = `${host.endsWith('.rfcx.org') ? 'https' : 'http'}://${host}/docs/auth-callback`
    const options = { ...swaggerUiExpressOptions, swaggerOptions: { ...swaggerUiOptions, oauth2RedirectUrl } }
    swaggerUi.setup(swaggerSpec, options)(req, res, next)
  }
})

export default router
