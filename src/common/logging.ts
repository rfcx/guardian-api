import { logger } from 'express-winston'
import { transports, format } from 'winston'
import { Request, Response } from 'express'
import { redactCredential } from './logging-redact'

/**
 * Build the request-log line.
 *
 * Exported so it can be unit-tested directly: express-winston does not expose
 * the `msg` function it is handed, so a test that goes through the logger
 * object cannot assert on the line this produces (OPEN-ITEMS §271).
 */
export const buildLogMessage = (req: Request, res: Response): string => {
  // OPEN-ITEMS §271: NEVER interpolate the raw Authorization header -- it is a
  // live user credential (see ./logging-redact.ts). The line SHAPE is
  // unchanged so existing support greps and Loki rules keep matching.
  // `?? 'undefined'` reproduces the pre-fix rendering for the no-credential
  // case byte-for-byte: the old code interpolated a possibly-undefined value,
  // which JS renders as the literal "undefined". That case is real
  // anonymous-traffic signal, so it must survive redaction unchanged.
  const auth = redactCredential(req.headers.authorization) ?? 'undefined'
  return `${req.method} ${res.statusCode} ${req.url} ${res.responseTime} Authorization: ${auth} ${JSON.stringify(req.body)}`
}

export default logger({
  transports: [
    new transports.Console()
  ],
  format: format.combine(
    format.simple()
  ),
  meta: false,
  msg: buildLogMessage,
  expressFormat: false
})
