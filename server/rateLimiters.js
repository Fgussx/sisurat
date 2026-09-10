import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    return false
  },
})

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: 'Terlalu banyak permintaan OTP, coba lagi dalam 10 menit',
  standardHeaders: true,
  legacyHeaders: false,
})

export const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: 'Terlalu banyak permintaan reset password, coba lagi dalam 30 menit',
  standardHeaders: true,
  legacyHeaders: false,
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Terlalu banyak request ke API, coba lagi nanti',
  standardHeaders: true,
  legacyHeaders: false,
})
