import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'

const isVercel = process.env.VERCEL === '1'

const transports = []

if (isVercel) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let metaStr = ''
          if (Object.keys(meta).length > 0 && JSON.stringify(meta) !== '{"service":"sisurat-api"}') {
            metaStr =  
          }
          return ${timestamp} []: 
        })
      ),
    })
  )
} else {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const logsDir = path.join(__dirname, '..', 'logs')
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 30,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 30,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let metaStr = ''
          if (Object.keys(meta).length > 0 && JSON.stringify(meta) !== '{"service":"sisurat-api"}') {
            metaStr =  
          }
          return ${timestamp} []: 
        })
      ),
    })
  )
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sisurat-api' },
  transports,
})

export default logger
