import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import config from '../../config'
import { Request, Response, NextFunction } from 'express'
import axios from '../axios'

const userMetaUrl = 'https://rfcx.org/user_metadata'
const appMetaUrl = 'https://rfcx.org/app_metadata'
let m2mToken

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

export const getM2MToken = async (): Promise<string> => {
  if (m2mToken === undefined || !isTokenValid()) {
    await requestM2MToken()
  }
  return m2mToken.access_token
}

function isTokenValid (): boolean {
  // if token exists and won't expire in next 10 mins
  return m2mToken !== undefined && m2mToken.expires_at - (new Date()).valueOf() > 600000
}

async function requestM2MToken (): Promise<void> {
  const url = `https://${config.AUTH0_DOMAIN}/oauth/token`
  const headers = {
    'Content-Type': 'application/json'
  }
  const payload = {
    client_id: config.AUTH0_CLIENT_ID,
    client_secret: config.AUTH0_CLIENT_SECRET,
    audience: config.AUTH0_AUDIENCE,
    grant_type: 'client_credentials'
  }

  return await axios.post(url, payload, { headers })
    .then(response => {
      m2mToken = response.data
      m2mToken.expires_at = new Date().valueOf() + (m2mToken.expires_in * 1000)
    })
}
