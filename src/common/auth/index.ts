import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import config from '../../config'
import { Request, Response, NextFunction } from 'express'

const metaUrl = 'https://rfcx.org/app_metadata'

export const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  issuer: `https://${config.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  requestProperty: 'auth'
})

export function parseUserData (req: Request, res: Response, next: NextFunction): void {
  const auth = req.auth
  req.user = {
    firstname: auth?.given_name ?? auth.user_metadata.given_name ?? undefined,
    lastname: auth?.family_name ?? auth.user_metadata.family_name ?? undefined,
    guid: auth?.guid ?? auth[metaUrl].guid ?? undefined,
    email: auth?.email
  }
  next()
}
