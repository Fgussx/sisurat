import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import fs from 'fs'
import multer from 'multer'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Role, Pengguna, FormatNomorSurat, TandaTanganDigital, SuratMasuk, SuratKeluar, Reminder, CustomFolder } from './models.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json())

// File upload config
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
}, express.static(uploadDir))

app.get('/api/file', (req, res) => {
  const nama = path.basename(req.query.nama || '')
  if (!nama) {
    return res.status(400).json({ error: 'Nama file wajib diisi' })
  }
  const fullPath = path.join(uploadDir, nama)
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File tidak ditemukan' })
  }
  res.setHeader('Content-Disposition', 'attachment')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.sendFile(fullPath)
})

app.get('/api/file-data', (req, res) => {
  const nama = path.basename(req.query.nama || '')
  if (!nama) {
    return res.status(400).json({ error: 'Nama file wajib diisi' })
  }
  const fullPath = path.join(uploadDir, nama)
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File tidak ditemukan' })
  }
  try {
    const data = fs.readFileSync(fullPath)
    res.json({ success: true, nama, data: data.toString('base64') })
  } catch (error) {
    console.error('Error reading file:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_')
    cb(null, `${Date.now()}_${base}${ext}`)
  },
})
const MAX_FILE_SIZE = 1.5 * 1024 * 1024
const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } })

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
        path: `/uploads/${req.file.filename}`,
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
    console.log('MongoDB connected')
    initializeDefaultRoles()
  })
  .catch(err => console.log('MongoDB connection error:', err))

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
      console.log('✓ Role Admin berhasil dibuat')
      console.log('  ID:', savedRole._id)
      console.log('  Nama:', savedRole.nama_role)
    } else {
      console.log('✓ Role Admin sudah ada')
      console.log('  ID:', adminRole._id)
    }
  } catch (error) {
    console.error('Error initializing roles:', error.message)
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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' })
  }

  try {
    const user = await Pengguna.findOne({ username, is_deleted: false }).populate('id_role')

    if (!user) {
      return res.status(404).json({ error: 'Username tidak terdaftar' })
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Password salah' })
    }

    res.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user._id,
        username: user.username,
        nama: user.nama,
        email: user.email,
        role: user.id_role ? user.id_role.nama_role : null,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/send-otp', async (req, res) => {
  const { username } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username wajib diisi' })
  }

  try {
    const user = await Pengguna.findOne({ username, is_deleted: false })
    
    if (!user) {
      return res.status(404).json({ error: 'Username tidak terdaftar' })
    }

    const otp = generateOTP()
    const expiresAt = Date.now() + 10 * 60 * 1000

    otpStore.set(username, { code: otp, expiresAt })

    const result = await sendOTP(username, user.email, otp, 'reset')

    if (result.success) {
      res.json({ success: true, message: 'OTP telah dikirim' })
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/verify-otp', (req, res) => {
  const { username, otp } = req.body

  if (!username || !otp) {
    return res.status(400).json({ error: 'Username dan OTP wajib diisi' })
  }

  const stored = otpStore.get(username)

  if (!stored) {
    return res.status(400).json({ error: 'OTP tidak ditemukan atau sudah kadaluarsa' })
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(username)
    return res.status(400).json({ error: 'OTP sudah kadaluarsa' })
  }

  if (stored.code !== otp) {
    return res.status(400).json({ error: 'OTP tidak valid' })
  }

  otpStore.delete(username)
  res.json({ success: true, message: 'OTP terverifikasi', token: username })
})

app.post('/api/reset-password', async (req, res) => {
  const { username, newPassword } = req.body

  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username dan password baru wajib diisi' })
  }

  try {
    const user = await Pengguna.findOne({ username, is_deleted: false })
    
    if (!user) {
      return res.status(404).json({ error: 'Username tidak terdaftar' })
    }

    await Pengguna.updateOne(
      { _id: user._id },
      { $set: { password: newPassword } }
    )

    res.json({ success: true, message: 'Password berhasil direset' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/create-user', async (req, res) => {
  const { username, password, nama, email, id_role } = req.body

  if (!username || !password || !nama || !email || !id_role) {
    return res.status(400).json({ error: 'Username, password, nama, email, dan id_role wajib diisi' })
  }

  try {
    const existingUser = await Pengguna.findOne({ username, is_deleted: false })
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username sudah terdaftar' })
    }

    const newUser = new Pengguna({
      username,
      password,
      nama,
      email,
      id_role,
      is_deleted: false,
    })

    const savedUser = await newUser.save()

    res.json({ 
      success: true, 
      message: 'Akun berhasil dibuat',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        nama: savedUser.nama,
      }
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Role.find().select('nama_role keterangan')
    res.json({ success: true, roles })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/roles', async (req, res) => {
  const { nama_role, keterangan } = req.body

  if (!nama_role) {
    return res.status(400).json({ error: 'nama_role wajib diisi' })
  }

  try {
    const existingRole = await Role.findOne({ nama_role })
    
    if (existingRole) {
      return res.status(400).json({ error: 'Role sudah ada' })
    }

    const newRole = new Role({
      nama_role,
      keterangan: keterangan || null,
    })

    const savedRole = await newRole.save()
    
    res.json({ 
      success: true, 
      message: 'Role berhasil dibuat',
      role: savedRole
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const users = await Pengguna.find({ is_deleted: false }).populate('id_role')
    res.json({ success: true, users })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/delete-user', async (req, res) => {
  const { username } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username wajib diisi' })
  }

  try {
    const user = await Pengguna.findOne({ username, is_deleted: false })
    
    if (!user) {
      return res.status(404).json({ error: 'Username tidak ditemukan' })
    }

    await Pengguna.deleteOne({ _id: user._id })

    res.json({ success: true, message: 'Akun berhasil dihapus' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/change-password', async (req, res) => {
  const { username, newPassword } = req.body

  if (!username || !newPassword) {
    return res.status(400).json({ error: 'Username dan password baru wajib diisi' })
  }

  try {
    const user = await Pengguna.findOne({ username, is_deleted: false })

    if (!user) {
      return res.status(404).json({ error: 'Username tidak ditemukan' })
    }

    await Pengguna.updateOne(
      { _id: user._id },
      { $set: { password: newPassword } }
    )

    res.json({ success: true, message: 'Password berhasil diganti' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/update-user', async (req, res) => {
  const { username, newUsername, newNama, id_role } = req.body

  if (!username) {
    return res.status(400).json({ error: 'Username wajib diisi' })
  }

  try {
    const user = await Pengguna.findOne({ username, is_deleted: false })

    if (!user) {
      return res.status(404).json({ error: 'Username tidak ditemukan' })
    }

    const updateData = {}
    
    // Check if new username is unique (if provided and different from current)
    if (newUsername && newUsername !== username) {
      const existingUser = await Pengguna.findOne({ username: newUsername, is_deleted: false })
      if (existingUser) {
        return res.status(400).json({ error: 'Username sudah digunakan' })
      }
      updateData.username = newUsername
    }
    
    // Update nama if provided
    if (newNama) {
      updateData.nama = newNama
    }
    
    // Update role if provided
    if (id_role) {
      updateData.id_role = id_role
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diubah' })
    }

    const updatedUser = await Pengguna.findByIdAndUpdate(user._id, updateData, { new: true }).populate('id_role')

    res.json({ 
      success: true, 
      message: 'Data pengguna berhasil diperbarui',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        nama: updatedUser.nama,
        email: updatedUser.email,
        id_role: updatedUser.id_role
      }
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/surat-masuk', async (req, res) => {
  try {
    const suratMasuk = await SuratMasuk.find({ is_deleted: false })
      .populate('id_user')
      .populate('id_format')
      .populate('id_surat_keluar_ref')
      .sort({ tanggal_terima: -1 })
    res.json({ success: true, data: suratMasuk })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/surat-masuk/:id', async (req, res) => {
  const { id } = req.params
  try {
    const surat = await SuratMasuk.findById(id)
      .populate('id_user')
      .populate('id_format')
      .populate('id_surat_keluar_ref')
    
    if (!surat || surat.is_deleted) {
      return res.status(404).json({ error: 'Surat tidak ditemukan' })
    }
    
    res.json({ success: true, data: surat })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/surat-masuk', async (req, res) => {
  const { id_user, nomor_surat, pengirim, folder, perihal, isi_surat, kategori, jenis_surat, tanggal_terima, file_lampiran } = req.body

  if (!nomor_surat || !pengirim || !perihal || !tanggal_terima) {
    return res.status(400).json({ error: 'Field wajib tidak lengkap' })
  }

  try {
    const userId = await resolveUserId(id_user)
    if (!userId) {
      return res.status(400).json({ error: 'Tidak ada pengguna terdaftar' })
    }

    const existingNomor = await SuratMasuk.findOne({ nomor_surat, is_deleted: false })
    if (existingNomor) {
      return res.status(400).json({ error: 'Nomor surat sudah ada' })
    }

    const newSurat = new SuratMasuk({
      id_user: userId,
      nomor_surat,
      pengirim,
      folder: folder || null,
      perihal,
      isi_surat: isi_surat || '',
      kategori: kategori || 'biasa',
      jenis_surat: jenis_surat || '',
      tanggal_terima,
      file_lampiran,
      status_tindak_lanjut: 'tidak',
      is_deleted: false,
    })

    const savedSurat = await newSurat.save()
    res.json({ success: true, message: 'Surat masuk berhasil ditambah', data: savedSurat })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/surat-masuk/:id', async (req, res) => {
  const { id } = req.params
  const { perihal, isi_surat, kategori, folder, nomor_surat, pengirim, tanggal_terima, jenis_surat, id_surat_keluar_ref } = req.body

  if (!perihal) {
    return res.status(400).json({ error: 'Perihal wajib diisi' })
  }

  try {
    const updateData = {}
    if (perihal) updateData.perihal = perihal
    if (isi_surat !== undefined) updateData.isi_surat = isi_surat
    if (kategori) updateData.kategori = kategori
    if (folder !== undefined) updateData.folder = folder
    if (nomor_surat !== undefined && nomor_surat) updateData.nomor_surat = nomor_surat
    if (pengirim !== undefined && pengirim) updateData.pengirim = pengirim
    if (tanggal_terima !== undefined && tanggal_terima) updateData.tanggal_terima = tanggal_terima
    if (jenis_surat !== undefined) updateData.jenis_surat = jenis_surat
    if (id_surat_keluar_ref) updateData.id_surat_keluar_ref = id_surat_keluar_ref

    const updated = await SuratMasuk.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    
    if (!updated) {
      return res.status(404).json({ error: 'Surat tidak ditemukan' })
    }
    
    res.json({ success: true, message: 'Surat masuk berhasil diperbarui', data: updated })
  } catch (error) {
    console.error('Error:', error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({ error: `${field} sudah terdaftar di sistem` })
    }
    res.status(500).json({ error: error.message || 'Server error' })
  }
})

app.patch('/api/surat-masuk/:id/status', async (req, res) => {
  const { id } = req.params
  const { status_tindak_lanjut, id_surat_keluar_ref } = req.body

  if (status_tindak_lanjut && !['tidak', 'iya'].includes(status_tindak_lanjut)) {
    return res.status(400).json({ error: 'Status tidak valid' })
  }

  try {
    const updateData = {}
    if (status_tindak_lanjut) updateData.status_tindak_lanjut = status_tindak_lanjut
    if (id_surat_keluar_ref) updateData.id_surat_keluar_ref = id_surat_keluar_ref

    const updated = await SuratMasuk.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    if (!updated) {
      return res.status(404).json({ error: 'Surat tidak ditemukan' })
    }

    res.json({ success: true, message: 'Status diperbarui', data: updated })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/surat-masuk/:id', async (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ error: 'ID surat wajib diisi' })
  }

  try {
    const surat = await SuratMasuk.findById(id)
    if (!surat) {
      return res.status(404).json({ error: 'Surat tidak ditemukan' })
    }

    await SuratMasuk.deleteOne({ _id: id })
    res.json({ success: true, message: 'Surat masuk berhasil dihapus' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/surat-keluar/next-nomor/:jenis_surat', async (req, res) => {
  const { jenis_surat } = req.params
  const BULAN_ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const KODE_JENIS = {
    "surat permohonan": "01", "surat tugas": "02", "surat pemberitahuan": "03",
    "surat perintah": "04", "surat balasan": "05", "surat undangan": "06",
    "surat rekomendasi": "07", "surat izin": "08", "surat edaran": "09",
    "surat perjanjian/kontrak": "10",
  }

  try {
    const tgl = new Date()
    const bulanRomawi = BULAN_ROMAWI[tgl.getMonth()]
    const tahun = tgl.getFullYear()
    const kodeJenis = KODE_JENIS[jenis_surat] || "00"

    const awalTahun = new Date(tahun, 0, 1)
    const akhirTahun = new Date(tahun, 11, 31, 23, 59, 59)

    const lastSurat = await SuratKeluar.findOne({
      is_deleted: false,
      jenis_surat: jenis_surat,
      tanggal_kirim: { $gte: awalTahun, $lte: akhirTahun },
    }).sort({ created_at: -1 })

    let urutan = 1
    if (lastSurat && lastSurat.nomor_surat) {
      const parts = lastSurat.nomor_surat.split('/')
      if (parts.length > 0) {
        const nomorPart = parts[0]
        const urutanPart = nomorPart.split('.')[0]
        const lastNum = parseInt(urutanPart)
        if (!isNaN(lastNum)) urutan = lastNum + 1
      }
    }

    const nomor = `${String(urutan).padStart(2, '0')}.${String(parseInt(kodeJenis)).padStart(3, '0')}/SSI-PCT/${bulanRomawi}/${tahun}`
    res.json({ success: true, nomor, urutan })
  } catch (error) {
    console.error('Error getting next nomor:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/surat-keluar', async (req, res) => {
  try {
    const suratKeluar = await SuratKeluar.find({ is_deleted: false })
      .populate('id_user')
      .populate('approved_by')
      .populate('id_format')
      .populate('id_ttd')
      .populate('id_surat_masuk_ref')
      .sort({ tanggal_kirim: -1 })
    res.json({ success: true, data: suratKeluar })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/surat-keluar/:id', async (req, res) => {
  const { id } = req.params
  try {
    const surat = await SuratKeluar.findById(id)
      .populate('id_user')
      .populate('approved_by')
      .populate('id_format')
      .populate('id_ttd')
      .populate('id_surat_masuk_ref')
    
    if (!surat || surat.is_deleted) {
      return res.status(404).json({ error: 'Surat tidak ditemukan' })
    }
    
    res.json({ success: true, data: surat })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/surat-keluar', async (req, res) => {
   const { id_user, nomor_surat, tujuan, folder, perihal, jenis_surat, isi_surat, kategori, tanggal_kirim, file_draft, auto_nomor, id_surat_masuk_ref } = req.body

   console.log("POST /api/surat-keluar - Full request body:", JSON.stringify(req.body, null, 2))

   // Auto-generate nomor surat if auto_nomor flag is set
   // Format: {kodeJenis}.{urutan}/SSI-PCT/{bulanRomawi}/{tahun}
   // Example: 04.011/SSI-PCT/V/2026
   let finalNomor = nomor_surat
   if (auto_nomor && jenis_surat && tanggal_kirim) {
     try {
       const tgl = new Date(tanggal_kirim)
       const BULAN_ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
       const bulanRomawi = BULAN_ROMAWI[tgl.getMonth()]

        // Kode jenis surat (sesuai requirement)
        // Format: {kodeJenis}.{urutan}/SSI-PCT/{bulanRomawi}/{tahun}
        // Contoh: 04.011/SSI-PCT/V/2026
        const KODE_JENIS = {
          "surat permohonan": "01",           // 01 = Surat Permohonan
          "surat tugas": "02",                // 02 = Surat Tugas
          "surat pemberitahuan": "03",        // 03 = Surat Pemberitahuan
          "surat perintah": "04",             // 04 = Surat Perintah
          "surat balasan": "05",              // 05 = Surat Balasan
          "surat undangan": "06",             // 06 = Surat Undangan
          "surat rekomendasi": "07",          // 07 = Surat Rekomendasi
          "surat izin": "08",                 // 08 = Surat Izin
          "surat edaran": "09",               // 09 = Surat Edaran
          "surat perjanjian/kontrak": "10",   // 10 = Surat Perjanjian/Kontrak
        }
       const kodeJenis = KODE_JENIS[jenis_surat] || "00"
       const tahun = tgl.getFullYear()
       const kodeInstansi = "SSI-PCT" // Kode kantor layanan Pacitan (fixed)

       // Get last nomor for this jenis_surat to increment urutan (reset tiap tahun)
       const awalTahun = new Date(tahun, 0, 1)
       const akhirTahun = new Date(tahun, 11, 31, 23, 59, 59)

       const lastSurat = await SuratKeluar.findOne({
         is_deleted: false,
         jenis_surat: jenis_surat,
         tanggal_kirim: { $gte: awalTahun, $lte: akhirTahun },
       }).sort({ created_at: -1 })

       let urutan = 1
       if (lastSurat && lastSurat.nomor_surat) {
         // Parse nomor untuk mendapatkan urutan
         // Format: 01.004/SSI-PCT/V/2026 -> ambil 01 (nomor urut, bagian pertama)
         const parts = lastSurat.nomor_surat.split('/')
         if (parts.length > 0) {
           const nomorPart = parts[0] // "01.004"
           const urutanPart = nomorPart.split('.')[0] // "01" (nomor urut)
           const lastNum = parseInt(urutanPart)
           if (!isNaN(lastNum)) urutan = lastNum + 1
         }
       }

       // Format: {kodeJenis}.{urutan}/SSI-PCT/{bulanRomawi}/{tahun}
       // Contoh: 04.011/SSI-PCT/V/2026
        finalNomor = `${String(urutan).padStart(2, '0')}.${String(parseInt(kodeJenis)).padStart(3, '0')}/${kodeInstansi}/${bulanRomawi}/${tahun}`
       console.log("Auto-generated nomor:", finalNomor)
     } catch (err) {
       console.error("Error auto-generating nomor:", err)
     }
   }

   if (!finalNomor || !tujuan || !perihal || !tanggal_kirim) {
     return res.status(400).json({ error: 'Field wajib tidak lengkap' })
   }

   try {
     const userId = await resolveUserId(id_user)
     if (!userId) {
       return res.status(400).json({ error: 'Tidak ada pengguna terdaftar' })
     }

     const existingNomor = await SuratKeluar.findOne({ nomor_surat: finalNomor, is_deleted: false })
     if (existingNomor) {
       return res.status(400).json({ error: 'Nomor surat sudah ada' })
     }

      const newSurat = new SuratKeluar({
        id_user: userId,
        nomor_surat: finalNomor,
        tujuan,
        folder: folder || null,
        perihal,
        jenis_surat: jenis_surat || 'surat tugas',
        isi_surat: isi_surat || '',
        kategori: kategori || 'biasa',
        tanggal_kirim,
        file_draft,
        id_surat_masuk_ref: id_surat_masuk_ref || null,
        status_approval: 'menunggu',
        is_deleted: false,
      })

      console.log("Created document object:")
      console.log("  id_user:", newSurat.id_user)
      console.log("  nomor_surat:", newSurat.nomor_surat)
      console.log("  isi_surat value:", JSON.stringify(newSurat.isi_surat))
      console.log("  isi_surat type:", typeof newSurat.isi_surat)
      console.log("  isi_surat length:", newSurat.isi_surat?.length)

       const savedSurat = await newSurat.save()
       
       // Jika ada id_surat_masuk_ref, update surat masuk dengan id_surat_keluar_ref
       if (id_surat_masuk_ref) {
         try {
           await SuratMasuk.findByIdAndUpdate(id_surat_masuk_ref, { id_surat_keluar_ref: savedSurat._id })
         } catch (err) {
           console.error('Error updating surat masuk ref:', err)
         }
       }

       console.log("After save - savedSurat:")
       console.log("  _id:", savedSurat._id)
       console.log("  nomor_surat:", savedSurat.nomor_surat)

       res.json({ success: true, message: 'Surat keluar berhasil ditambah', data: savedSurat, nomor_surat: finalNomor })
   } catch (error) {
     console.error('Error:', error)
     res.status(500).json({ error: 'Server error' })
   }
  })

app.patch('/api/surat-keluar/:id', async (req, res) => {
   const { id } = req.params
   const { perihal, jenis_surat, isi_surat, kategori, folder, file_draft, nomor_surat, tujuan, tanggal_kirim } = req.body

   if (!perihal) {
     return res.status(400).json({ error: 'Perihal wajib diisi' })
   }

    try {
      const updateData = {}
      if (perihal) updateData.perihal = perihal
      if (jenis_surat !== undefined) updateData.jenis_surat = jenis_surat
      if (isi_surat !== undefined) updateData.isi_surat = isi_surat || ''
      if (kategori) updateData.kategori = kategori
      if (folder !== undefined) updateData.folder = folder
      if (file_draft !== undefined) updateData.file_draft = file_draft
      if (nomor_surat !== undefined && nomor_surat) updateData.nomor_surat = nomor_surat
      if (tujuan !== undefined && tujuan) updateData.tujuan = tujuan
      if (tanggal_kirim !== undefined && tanggal_kirim) updateData.tanggal_kirim = tanggal_kirim

      const updated = await SuratKeluar.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
     
     if (!updated) {
       return res.status(404).json({ error: 'Surat tidak ditemukan' })
     }
     
     res.json({ success: true, message: 'Surat keluar berhasil diperbarui', data: updated })
   } catch (error) {
     console.error('Error:', error)
     if (error.code === 11000) {
       const field = Object.keys(error.keyValue)[0]
       return res.status(400).json({ error: `${field} sudah terdaftar di sistem` })
     }
     res.status(500).json({ error: error.message || 'Server error' })
   }
 })

app.patch('/api/surat-keluar/:id/approval', async (req, res) => {
  const { id } = req.params
  const { status_approval, approved_by, catatan_revisi } = req.body

  if (!status_approval || !['menunggu', 'disetujui', 'ditolak'].includes(status_approval)) {
    return res.status(400).json({ error: 'Status approval tidak valid' })
  }

  try {
    const updateData = {
      status_approval,
      tanggal_approval: new Date(),
    }
    
    if (approved_by) updateData.approved_by = approved_by
    if (catatan_revisi) updateData.catatan_revisi = catatan_revisi

    const updatedSurat = await SuratKeluar.findByIdAndUpdate(id, updateData, { new: true })
    
    if (!updatedSurat) {
      return res.status(404).json({ error: 'Surat tidak ditemukan' })
    }

     res.json({ success: true, message: 'Status approval berhasil diupdate', data: updatedSurat })
   } catch (error) {
     console.error('Error:', error)
     res.status(500).json({ error: 'Server error' })
   }
 })

app.delete('/api/surat-keluar/:id', async (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ error: 'ID surat wajib diisi' })
  }

  try {
    const surat = await SuratKeluar.findById(id)
    if (!surat) {
      return res.status(404).json({ error: 'Surat tidak ditemukan' })
    }

    await SuratKeluar.deleteOne({ _id: id })
    res.json({ success: true, message: 'Surat keluar berhasil dihapus' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// ==========================================
// Custom Folder Endpoints
// ==========================================

app.get('/api/custom-folders/:tipe', async (req, res) => {
  const { tipe } = req.params

  if (!['masuk', 'keluar'].includes(tipe)) {
    return res.status(400).json({ error: 'Tipe surat tidak valid' })
  }

  try {
    const folders = await CustomFolder.find({ tipe_surat: tipe })
    res.json({ success: true, data: folders })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/custom-folders', async (req, res) => {
  const { tipe_surat, nama_folder } = req.body

  if (!tipe_surat || !nama_folder) {
    return res.status(400).json({ error: 'Tipe surat dan nama folder wajib diisi' })
  }

  if (!['masuk', 'keluar'].includes(tipe_surat)) {
    return res.status(400).json({ error: 'Tipe surat tidak valid' })
  }

  try {
    const existing = await CustomFolder.findOne({ tipe_surat, nama_folder })
    if (existing) {
      return res.status(400).json({ error: 'Folder sudah ada' })
    }

    const newFolder = new CustomFolder({
      tipe_surat,
      nama_folder,
    })

    const saved = await newFolder.save()
    res.json({ success: true, message: 'Folder berhasil dibuat', data: saved })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/custom-folders/:id', async (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ error: 'ID folder wajib diisi' })
  }

  try {
    const folder = await CustomFolder.findById(id)
    if (!folder) {
      return res.status(404).json({ error: 'Folder tidak ditemukan' })
    }

    await CustomFolder.deleteOne({ _id: id })
    res.json({ success: true, message: 'Folder berhasil dihapus' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

 app.delete('/api/custom-folders/name/:nama', async (req, res) => {
    const { nama } = req.params
 
    if (!nama) {
      return res.status(400).json({ error: 'Nama folder wajib diisi' })
    }
 
    try {
      const folder = await CustomFolder.findOne({ nama_folder: nama })
      if (!folder) {
        return res.status(404).json({ error: 'Folder tidak ditemukan' })
      }
 
      await CustomFolder.deleteOne({ _id: folder._id })
      res.json({ success: true, message: 'Folder berhasil dihapus' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Server error' })
    }
 })

 app.patch('/api/custom-folders/name/:nama', async (req, res) => {
    const { nama } = req.params
    const { nama_folder_baru } = req.body

    if (!nama || !nama_folder_baru) {
      return res.status(400).json({ error: 'Nama folder lama dan baru wajib diisi' })
    }

    try {
      const folder = await CustomFolder.findOne({ nama_folder: nama })
      if (!folder) {
        return res.status(404).json({ error: 'Folder tidak ditemukan' })
      }

      folder.nama_folder = nama_folder_baru
      await folder.save()
      res.json({ success: true, message: 'Folder berhasil diubah' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Server error' })
    }
 })

// ==========================================
// Reminder Endpoints
// ==========================================

app.get('/api/reminders', async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate({ path: 'id_surat_masuk', populate: { path: 'id_surat_keluar_ref' } })
      .sort({ tanggal_batas: 1 })
    res.json({ success: true, data: reminders })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/reminders', async (req, res) => {
  const { id_surat_masuk, tanggal_batas, keterangan } = req.body

  if (!id_surat_masuk || !tanggal_batas) {
    return res.status(400).json({ error: 'Field wajib tidak lengkap' })
  }

  try {
    const newReminder = new Reminder({
      id_surat_masuk,
      tanggal_batas: new Date(tanggal_batas),
      status: 'menunggu',
      keterangan: keterangan || null,
    })
    const saved = await newReminder.save()
    res.json({ success: true, message: 'Reminder dibuat', data: saved })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/reminders/:id', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status || !['menunggu', 'selesai', 'terlewat'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' })
  }

  try {
    const updated = await Reminder.findByIdAndUpdate(id, { status }, { new: true })
    if (!updated) return res.status(404).json({ error: 'Reminder tidak ditemukan' })
    res.json({ success: true, message: 'Reminder diperbarui', data: updated })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/reminders/:id', async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Reminder dihapus' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// ==========================================
// Migration Endpoints
// ==========================================

app.post('/api/migrate/isi-surat', async (req, res) => {
  try {
    // Update SuratMasuk documents
    const masukResult = await SuratMasuk.updateMany(
      { isi_surat: { $in: [null, undefined] } },
      { $set: { isi_surat: '' } }
    )

    // Update SuratKeluar documents
    const keluarResult = await SuratKeluar.updateMany(
      { isi_surat: { $in: [null, undefined] } },
      { $set: { isi_surat: '' } }
    )

    res.json({
      success: true,
      message: 'Migration completed',
      suratMasuk: masukResult.modifiedCount,
      suratKeluar: keluarResult.modifiedCount,
    })
  } catch (error) {
    console.error('Migration error:', error)
    res.status(500).json({ error: 'Migration failed' })
  }
})

const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'dist')))

// Serve print-pdf page
app.get('/print-pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  }
  next()
})

app.listen(PORT, () => {
  console.log(`Server berjalan di http://0.0.0.0:${PORT}`)
})
