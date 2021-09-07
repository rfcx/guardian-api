import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import config from '../../config'

export const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  // audience: config.AUTH0_API_AUDIENCE TODO:// check if this property is really important and more secure,
  issuer: `https://${config.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
})
