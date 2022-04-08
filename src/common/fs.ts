import { unlink } from 'fs'
import { promisify } from 'util'

export const unlinkAsync = promisify(unlink)
