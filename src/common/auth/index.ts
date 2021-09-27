import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import config from '../../config'
import { Request, Response, NextFunction } from 'express'

const userMetaUrl = 'https://rfcx.org/user_metadata'
const appMetaUrl = 'https://rfcx.org/app_metadata'

export const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  issuer: `https://${config.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  requestProperty: 'auth'
})

export function parseUserData (req: Request, res: Response, next: NextFunction): void {
  const auth = req.auth
  const userMetaData = auth?.user_metadata ?? auth[userMetaUrl] ?? {}
  const appMetaData = auth?.app_metadata ?? auth[appMetaUrl] ?? {}
  req.user = {
    firstname: auth?.given_name ?? userMetaData.given_name,
    lastname: auth?.family_name ?? userMetaData.family_name,
    guid: auth?.guid ?? appMetaData.guid,
    email: auth?.email
  }
  next()
}
