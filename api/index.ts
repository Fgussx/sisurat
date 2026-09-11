import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import multer from 'multer'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cloudinary from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import logger from '../server/logger.js'
import * as validators from '../server/validators.js'
import { loginLimiter, otpLimiter, passwordResetLimiter, apiLimiter } from '../server/rateLimiters.js'
import { Role, Pengguna, FormatNomorSurat, TandaTanganDigital, SuratMasuk, SuratKeluar, Reminder, CustomFolder } from '../models.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}))

app.use(apiLimiter)

logger.info('Server starting...', { env: process.env.NODE_ENV, timestamp: new Date().toISOString() })

// Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'sisurat/uploads',
    resource_type: 'auto',
  },
})

const upload = multer({ 
  storage,
  limits: { fileSize: 1.5 * 1024 * 1024 }
})

app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Ukuran file maksimal 1,5 MB' })
      }
      return res.status(400).json({ error: err.message || 'Gagal mengunggah file' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File wajib diunggah' })
    }
    res.json({
      success: true,
      file: {
        nama: req.file.originalname,
        path: req.file.secure_url,
        ukuran: req.file.size,
        mime: req.file.mimetype,
      },
    })
  })
})

// Connect to MongoDB
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 2,
  authSource: 'admin',
  serverApi: { version: '1', strict: true, deprecationErrors: true },
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sisurat', mongooseOptions)
  .then(() => {
    logger.info('MongoDB connected successfully')
    initializeDefaultRoles()
  })
  .catch(err => {
    logger.error('MongoDB connection error:', { error: err.message, stack: err.stack })
  })

const db = mongoose.connection

async function initializeDefaultRoles() {
  try {
    const adminRole = await Role.findOne({ nama_role: 'Admin' })
    
    if (!adminRole) {
      const newAdminRole = new Role({
        nama_role: 'Admin',
        keterangan: 'Administrator sistem dengan akses penuh',
      })
      const savedRole = await newAdminRole.save()
      logger.info('Role Admin berhasil dibuat', { roleId: savedRole._id })
    } else {
      logger.info('Role Admin sudah ada', { roleId: adminRole._id })
    }
  } catch (error) {
    logger.error('Error initializing roles:', { error: error.message, stack: error.stack })
  }
}

async function resolveUserId(idUser) {
  if (idUser && mongoose.isValidObjectId(idUser)) {
    const exists = await Pengguna.exists({ _id: idUser, is_deleted: false })
    if (exists) return idUser
  }
  const adminRole = await Role.findOne({ nama_role: 'Admin' })
  if (adminRole) {
    const admin = await Pengguna.findOne({ id_role: adminRole._id, is_deleted: false })
    if (admin) return admin._id
  }
  const anyUser = await Pengguna.findOne({ is_deleted: false })
  return anyUser ? anyUser._id : null
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const otpStore = new Map()

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendOTP(username, email, otp, type = 'reset') {
  try {
    console.log(`Sending ${type} OTP ${otp} to ${email}`)
    
    const title = 'Reset Password OTP'
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${title} - SiSurat (Username: ${username})`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0F172A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2>${title}</h2>
          </div>
          <div style="background: #F5F5F5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Username: <strong>${username}</strong>
            </p>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              Gunakan kode OTP berikut untuk melanjutkan proses reset password:
            </p>
            <div style="background: white; border: 2px solid #2563EB; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #2563EB; letter-spacing: 4px; margin: 0;">
                ${otp}
              </p>
            </div>
            <p style="color: #999; font-size: 12px;">
              Kode OTP ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Jika Anda tidak meminta reset password, abaikan email ini.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2024 SiSurat — Sistem Manajemen Surat Digital</p>
          </div>
        </div>
      `,
    })
    console.log('OTP sent successfully to ' + email)
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: 'Gagal mengirim OTP: ' + error.message }
  }
}

// JWT Utility Functions
function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return null
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (err) {
    return null
  }
}

// Middleware: Verify JWT Token
function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token tidak ditemukan' })
  }

  const decoded = verifyAccessToken(token)
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Token tidak valid atau sudah kadaluarsa' })
  }

  req.userId = decoded.userId
  next()
}

// Middleware: Verify Admin Role
async function verifyAdminRole(req, res, next) {
  try {
    const user = await Pengguna.findById(req.userId).populate('id_role')
    if (!user || user.id_role.nama_role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Akses ditolak: Admin saja' })
    }
    next()
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// Middleware: Validate Request Body
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    })

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }))
      return res.status(400).json({
        success: false,
        error: 'Validasi gagal',
        details,
      })
    }

    req.body = value
    next()
  }
}

// Export app for Vercel
export default app
