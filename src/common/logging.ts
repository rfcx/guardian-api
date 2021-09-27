import { logger } from 'express-winston'
import { transports, format } from 'winston'
import { Request, Response } from 'express'

export default logger({
  transports: [
    new transports.Console()
  ],
  format: format.combine(
    format.simple()
  ),
  meta: false,
  msg: (req: Request, res: Response) => {
    return `${req.method} ${res.statusCode} ${req.url} ${res.responseTime} Authorization: ${req.headers.authorization as string} ${JSON.stringify(req.body)}`
  },
  expressFormat: false
})
