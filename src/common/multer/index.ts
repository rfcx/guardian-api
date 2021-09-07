import multer from 'multer'

export const multerFile = multer({ storage: multer.memoryStorage() })
