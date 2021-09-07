import type { Request, Response, NextFunction } from 'express'

export function errorHandler (err: Error, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    return next(err)
  }
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Unauthorized')
  } else {
    console.error('Unexpected error', err)
    res.sendStatus(500)
  }
}

export function notFoundHandler (_req: Request, res: Response, next: NextFunction): void {
  res.status(404).send('Not found')
}
