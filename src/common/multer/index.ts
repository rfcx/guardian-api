import multer from 'multer'

export const multerFile = multer({ dest: process.env.CACHE_DIRECTORY })
