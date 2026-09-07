import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sendOTP } from './mailer.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const otpStore = new Map<string, { code: string; expiresAt: number }>()

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi' })
  }

  const otp = generateOTP()
  const expiresAt = Date.now() + 10 * 60 * 1000

  otpStore.set(email, { code: otp, expiresAt })

  const result = await sendOTP(email, otp)

  if (result.success) {
    res.json({ success: true, message: 'OTP telah dikirim ke email Anda' })
  } else {
    res.status(500).json(result)
  }
})

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email dan OTP wajib diisi' })
  }

  const stored = otpStore.get(email)

  if (!stored) {
    return res.status(400).json({ error: 'OTP tidak ditemukan atau sudah kadaluarsa' })
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email)
    return res.status(400).json({ error: 'OTP sudah kadaluarsa' })
  }

  if (stored.code !== otp) {
    return res.status(400).json({ error: 'OTP tidak valid' })
  }

  otpStore.delete(email)
  res.json({ success: true, message: 'OTP terverifikasi', token: email })
})

app.post('/api/reset-password', (req, res) => {
  const { email, newPassword } = req.body

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email dan password baru wajib diisi' })
  }

  res.json({ success: true, message: 'Password berhasil direset' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})
