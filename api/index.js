import dns from 'dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import * as validators from '../server/validators.js'
import { loginLimiter, otpLimiter, passwordResetLimiter, apiLimiter } from '../server/rateLimiters.js'
import { Role, Pengguna, SuratMasuk, SuratKeluar, Reminder, CustomFolder, TandaTanganDigital, FormatNomorSurat } from '../models.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(apiLimiter)

// MongoDB connection (lazy)
let dbConnected = false
async function ensureDB() {
  if (dbConnected && mongoose.connection.readyState >= 1) return
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    authSource: 'admin',
  })
  dbConnected = true
}

// JWT helpers
function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
}
function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}
function verifyAccessToken(token) {
  try { return jwt.verify(token, process.env.JWT_SECRET) } catch { return null }
}
function verifyRefreshToken(token) {
  try { return jwt.verify(token, process.env.JWT_REFRESH_SECRET) } catch { return null }
}

// Middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, error: 'Token tidak ditemukan' })
  const decoded = verifyAccessToken(token)
  if (!decoded) return res.status(401).json({ success: false, error: 'Token tidak valid atau sudah kadaluarsa' })
  req.userId = decoded.userId
  next()
}

function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true, convert: true })
    if (error) {
      return res.status(400).json({ success: false, error: 'Validasi gagal', details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })) })
    }
    req.body = value
    next()
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

// Health check
app.get('/api/test-db', async (req, res) => {
  try {
    const start = Date.now()
    await ensureDB()
    const db = mongoose.connection.db
    await db.admin().ping()
    const latency = Date.now() - start
    const collections = await db.listCollections().toArray()
    const counts = {}
    for (const c of collections) { counts[c.name] = await db.collection(c.name).countDocuments() }
    res.json({ mongodb: { status: 'CONNECTED', latency: `${latency}ms` }, database: { name: db.databaseName, collections: collections.map(c => c.name), counts } })
  } catch (err) {
    res.json({ mongodb: { status: 'FAILED', error: err.message } })
  }
})

// ========== AUTH ROUTES ==========
app.post('/api/login', loginLimiter, validateRequest(validators.loginSchema), async (req, res) => {
  try {
    await ensureDB()
    const { username, password } = req.body
    const user = await Pengguna.findOne({ username, is_deleted: false }).populate('id_role')
    if (!user) return res.status(404).json({ success: false, error: 'Username tidak terdaftar' })
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return res.status(401).json({ success: false, error: 'Password salah' })
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' })
    res.json({ success: true, message: 'Login berhasil', user: { id: user._id, username: user.username, nama: user.nama, email: user.email, role: user.id_role?.nama_role }, accessToken })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

app.post('/api/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!refreshToken) return res.status(401).json({ success: false, error: 'Refresh token tidak ditemukan' })
  const decoded = verifyRefreshToken(refreshToken)
  if (!decoded) return res.status(401).json({ success: false, error: 'Refresh token tidak valid' })
  const accessToken = generateAccessToken(decoded.userId)
  res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' })
  res.json({ success: true, message: 'Token refreshed', accessToken })
})

app.post('/api/create-user', authenticateToken, validateRequest(validators.createUserSchema), async (req, res) => {
  try {
    await ensureDB()
    const { username, password, nama, email, id_role } = req.body
    const existingUser = await Pengguna.findOne({ username, is_deleted: false })
    if (existingUser) return res.status(400).json({ success: false, error: 'Username sudah terdaftar' })
    const newUser = new Pengguna({ username, password, nama, email, id_role, is_deleted: false })
    const savedUser = await newUser.save()
    res.json({ success: true, message: 'Akun berhasil dibuat', user: { id: savedUser._id, username: savedUser.username, nama: savedUser.nama } })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

app.get('/api/roles', async (req, res) => {
  try {
    await ensureDB()
    const roles = await Role.find().select('nama_role keterangan')
    res.json({ success: true, roles })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.post('/api/roles', async (req, res) => {
  try {
    await ensureDB()
    const { nama_role, keterangan } = req.body
    if (!nama_role) return res.status(400).json({ error: 'nama_role wajib diisi' })
    const existingRole = await Role.findOne({ nama_role })
    if (existingRole) return res.status(400).json({ error: 'Role sudah ada' })
    const savedRole = await new Role({ nama_role, keterangan: keterangan || null }).save()
    res.json({ success: true, message: 'Role berhasil dibuat', role: savedRole })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const users = await Pengguna.find({ is_deleted: false }).populate('id_role')
    res.json({ success: true, users })
  } catch (error) { res.status(500).json({ success: false, error: 'Server error' }) }
})

app.delete('/api/delete-user', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { username } = req.body
    const user = await Pengguna.findOne({ username, is_deleted: false })
    if (!user) return res.status(404).json({ success: false, error: 'Username tidak ditemukan' })
    await Pengguna.deleteOne({ _id: user._id })
    res.json({ success: true, message: 'Akun berhasil dihapus' })
  } catch (error) { res.status(500).json({ success: false, error: 'Server error' }) }
})

app.post('/api/change-password', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { username, newPassword } = req.body
    const user = await Pengguna.findOne({ username, is_deleted: false })
    if (!user) return res.status(404).json({ success: false, error: 'Username tidak ditemukan' })
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password berhasil diganti' })
  } catch (error) { res.status(500).json({ success: false, error: 'Server error' }) }
})

app.patch('/api/update-user', async (req, res) => {
  try {
    await ensureDB()
    const { username, newUsername, newNama, id_role } = req.body
    if (!username) return res.status(400).json({ error: 'Username wajib diisi' })
    const user = await Pengguna.findOne({ username, is_deleted: false })
    if (!user) return res.status(404).json({ error: 'Username tidak ditemukan' })
    const updateData = {}
    if (newUsername && newUsername !== username) {
      const existing = await Pengguna.findOne({ username: newUsername, is_deleted: false })
      if (existing) return res.status(400).json({ error: 'Username sudah digunakan' })
      updateData.username = newUsername
    }
    if (newNama) updateData.nama = newNama
    if (id_role) updateData.id_role = id_role
    if (Object.keys(updateData).length === 0) return res.status(400).json({ error: 'Tidak ada data yang diubah' })
    const updated = await Pengguna.findByIdAndUpdate(user._id, updateData, { new: true }).populate('id_role')
    res.json({ success: true, message: 'Data pengguna berhasil diperbarui', user: { id: updated._id, username: updated.username, nama: updated.nama, email: updated.email, id_role: updated.id_role } })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

// ========== SURAT MASUK ROUTES ==========
app.get('/api/surat-masuk', async (req, res) => {
  try {
    await ensureDB()
    const data = await SuratMasuk.find({ is_deleted: false }).populate('id_user').populate('id_format').populate('id_surat_keluar_ref').sort({ tanggal_terima: -1 })
    res.json({ success: true, data })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.get('/api/surat-masuk/:id', async (req, res) => {
  try {
    await ensureDB()
    const surat = await SuratMasuk.findById(req.params.id).populate('id_user').populate('id_format').populate('id_surat_keluar_ref')
    if (!surat || surat.is_deleted) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    res.json({ success: true, data: surat })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.post('/api/surat-masuk', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { id_user, nomor_surat, pengirim, folder, perihal, isi_surat, kategori, jenis_surat, tanggal_terima, file_lampiran } = req.body
    const userId = await resolveUserId(id_user)
    if (!userId) return res.status(400).json({ error: 'Tidak ada pengguna terdaftar' })
    const existingNomor = await SuratMasuk.findOne({ nomor_surat, is_deleted: false })
    if (existingNomor) return res.status(400).json({ error: 'Nomor surat sudah ada' })
    const newSurat = new SuratMasuk({ id_user: userId, nomor_surat, pengirim, folder: folder || null, perihal, isi_surat: isi_surat || '', kategori: kategori || 'biasa', jenis_surat: jenis_surat || '', tanggal_terima, file_lampiran, status_tindak_lanjut: 'tidak', is_deleted: false })
    const saved = await newSurat.save()
    res.json({ success: true, message: 'Surat masuk berhasil ditambah', data: saved })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.patch('/api/surat-masuk/:id', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { id } = req.params
    const { perihal, isi_surat, kategori, folder, nomor_surat, pengirim, tanggal_terima, jenis_surat, id_surat_keluar_ref } = req.body
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
    if (!updated) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    res.json({ success: true, message: 'Surat masuk berhasil diperbarui', data: updated })
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: `${Object.keys(error.keyValue)[0]} sudah terdaftar di sistem` })
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/surat-masuk/:id/status', async (req, res) => {
  try {
    await ensureDB()
    const { id } = req.params
    const { status_tindak_lanjut, id_surat_keluar_ref } = req.body
    if (status_tindak_lanjut && !['tidak', 'iya'].includes(status_tindak_lanjut)) return res.status(400).json({ error: 'Status tidak valid' })
    const updateData = {}
    if (status_tindak_lanjut) updateData.status_tindak_lanjut = status_tindak_lanjut
    if (id_surat_keluar_ref) updateData.id_surat_keluar_ref = id_surat_keluar_ref
    const updated = await SuratMasuk.findByIdAndUpdate(id, updateData, { new: true })
    if (!updated) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    res.json({ success: true, message: 'Status diperbarui', data: updated })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.delete('/api/surat-masuk/:id', async (req, res) => {
  try {
    await ensureDB()
    const surat = await SuratMasuk.findById(req.params.id)
    if (!surat) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    await SuratMasuk.deleteOne({ _id: req.params.id })
    res.json({ success: true, message: 'Surat masuk berhasil dihapus' })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

// ========== SURAT KELUAR ROUTES ==========
app.get('/api/surat-keluar/next-nomor/:jenis_surat', async (req, res) => {
  try {
    await ensureDB()
    const { jenis_surat } = req.params
    const BULAN_ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    const KODE_JENIS = { "surat permohonan": "01", "surat tugas": "02", "surat pemberitahuan": "03", "surat perintah": "04", "surat balasan": "05", "surat undangan": "06", "surat rekomendasi": "07", "surat izin": "08", "surat edaran": "09", "surat perjanjian/kontrak": "10" }
    const tgl = new Date()
    const bulanRomawi = BULAN_ROMAWI[tgl.getMonth()]
    const tahun = tgl.getFullYear()
    const kodeJenis = KODE_JENIS[jenis_surat] || "00"
    const lastSurat = await SuratKeluar.findOne({ is_deleted: false, jenis_surat, tanggal_kirim: { $gte: new Date(tahun, 0, 1), $lte: new Date(tahun, 11, 31, 23, 59, 59) } }).sort({ created_at: -1 })
    let urutan = 1
    if (lastSurat && lastSurat.nomor_surat) {
      const parts = lastSurat.nomor_surat.split('/')
      if (parts.length > 0) { const lastNum = parseInt(parts[0].split('.')[0]); if (!isNaN(lastNum)) urutan = lastNum + 1 }
    }
    const nomor = `${String(urutan).padStart(2, '0')}.${String(parseInt(kodeJenis)).padStart(3, '0')}/SSI-PCT/${bulanRomawi}/${tahun}`
    res.json({ success: true, nomor, urutan })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.get('/api/surat-keluar', async (req, res) => {
  try {
    await ensureDB()
    const data = await SuratKeluar.find({ is_deleted: false }).populate('id_user').populate('approved_by').populate('id_format').populate('id_ttd').populate('id_surat_masuk_ref').sort({ tanggal_kirim: -1 })
    res.json({ success: true, data })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.get('/api/surat-keluar/:id', async (req, res) => {
  try {
    await ensureDB()
    const surat = await SuratKeluar.findById(req.params.id).populate('id_user').populate('approved_by').populate('id_format').populate('id_ttd').populate('id_surat_masuk_ref')
    if (!surat || surat.is_deleted) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    res.json({ success: true, data: surat })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.post('/api/surat-keluar', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { id_user, nomor_surat, tujuan, folder, perihal, jenis_surat, isi_surat, kategori, tanggal_kirim, file_draft, auto_nomor, id_surat_masuk_ref } = req.body
    let finalNomor = nomor_surat
    if (auto_nomor && jenis_surat && tanggal_kirim) {
      const tgl = new Date(tanggal_kirim)
      const BULAN_ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
      const bulanRomawi = BULAN_ROMAWI[tgl.getMonth()]
      const KODE_JENIS = { "surat permohonan": "01", "surat tugas": "02", "surat pemberitahuan": "03", "surat perintah": "04", "surat balasan": "05", "surat undangan": "06", "surat rekomendasi": "07", "surat izin": "08", "surat edaran": "09", "surat perjanjian/kontrak": "10" }
      const kodeJenis = KODE_JENIS[jenis_surat] || "00"
      const tahun = tgl.getFullYear()
      const lastSurat = await SuratKeluar.findOne({ is_deleted: false, jenis_surat, tanggal_kirim: { $gte: new Date(tahun, 0, 1), $lte: new Date(tahun, 11, 31, 23, 59, 59) } }).sort({ created_at: -1 })
      let urutan = 1
      if (lastSurat && lastSurat.nomor_surat) { const parts = lastSurat.nomor_surat.split('/'); if (parts.length > 0) { const lastNum = parseInt(parts[0].split('.')[0]); if (!isNaN(lastNum)) urutan = lastNum + 1 } }
      finalNomor = `${String(urutan).padStart(2, '0')}.${String(parseInt(kodeJenis)).padStart(3, '0')}/SSI-PCT/${bulanRomawi}/${tahun}`
    }
    if (!finalNomor || !tujuan || !perihal || !tanggal_kirim) return res.status(400).json({ error: 'Field wajib tidak lengkap' })
    const userId = await resolveUserId(id_user)
    if (!userId) return res.status(400).json({ error: 'Tidak ada pengguna terdaftar' })
    const existingNomor = await SuratKeluar.findOne({ nomor_surat: finalNomor, is_deleted: false })
    if (existingNomor) return res.status(400).json({ error: 'Nomor surat sudah ada' })
    const newSurat = new SuratKeluar({ id_user: userId, nomor_surat: finalNomor, tujuan, folder: folder || null, perihal, jenis_surat: jenis_surat || 'surat tugas', isi_surat: isi_surat || '', kategori: kategori || 'biasa', tanggal_kirim, file_draft, id_surat_masuk_ref: id_surat_masuk_ref || null, status_approval: 'menunggu', is_deleted: false })
    const saved = await newSurat.save()
    if (id_surat_masuk_ref) { try { await SuratMasuk.findByIdAndUpdate(id_surat_masuk_ref, { id_surat_keluar_ref: saved._id }) } catch {} }
    res.json({ success: true, message: 'Surat keluar berhasil ditambah', data: saved, nomor_surat: finalNomor })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.patch('/api/surat-keluar/:id', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { id } = req.params
    const { perihal, jenis_surat, isi_surat, kategori, folder, file_draft, nomor_surat, tujuan, tanggal_kirim, file_final_ttd, id_ttd } = req.body
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
    if (file_final_ttd) updateData.file_final_ttd = file_final_ttd
    if (id_ttd) updateData.id_ttd = id_ttd
    const updated = await SuratKeluar.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    res.json({ success: true, message: 'Surat keluar berhasil diperbarui', data: updated })
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: `${Object.keys(error.keyValue)[0]} sudah terdaftar di sistem` })
    res.status(500).json({ error: 'Server error' })
  }
})

app.patch('/api/surat-keluar/:id/approval', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { id } = req.params
    const { status_approval, approved_by, catatan_revisi } = req.body
    const updateData = { status_approval, tanggal_approval: new Date() }
    if (approved_by) updateData.approved_by = approved_by
    if (catatan_revisi) updateData.catatan_revisi = catatan_revisi
    const updated = await SuratKeluar.findByIdAndUpdate(id, updateData, { new: true })
    if (!updated) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    res.json({ success: true, message: 'Status approval berhasil diupdate', data: updated })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.delete('/api/surat-keluar/:id', async (req, res) => {
  try {
    await ensureDB()
    const surat = await SuratKeluar.findById(req.params.id)
    if (!surat) return res.status(404).json({ error: 'Surat tidak ditemukan' })
    await SuratKeluar.deleteOne({ _id: req.params.id })
    res.json({ success: true, message: 'Surat keluar berhasil dihapus' })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

// ========== CUSTOM FOLDERS ==========
app.get('/api/custom-folders/:tipe', async (req, res) => {
  try {
    await ensureDB()
    const { tipe } = req.params
    if (!['masuk', 'keluar'].includes(tipe)) return res.status(400).json({ error: 'Tipe surat tidak valid' })
    const folders = await CustomFolder.find({ tipe_surat: tipe })
    res.json({ success: true, data: folders })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.post('/api/custom-folders', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { tipe_surat, nama_folder } = req.body
    const existing = await CustomFolder.findOne({ tipe_surat, nama_folder })
    if (existing) return res.status(400).json({ error: 'Folder sudah ada' })
    const saved = await new CustomFolder({ tipe_surat, nama_folder }).save()
    res.json({ success: true, message: 'Folder berhasil dibuat', data: saved })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.delete('/api/custom-folders/:id', async (req, res) => {
  try {
    await ensureDB()
    const folder = await CustomFolder.findById(req.params.id)
    if (!folder) return res.status(404).json({ error: 'Folder tidak ditemukan' })
    await CustomFolder.deleteOne({ _id: req.params.id })
    res.json({ success: true, message: 'Folder berhasil dihapus' })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.delete('/api/custom-folders/name/:nama', async (req, res) => {
  try {
    await ensureDB()
    const folder = await CustomFolder.findOne({ nama_folder: req.params.nama })
    if (!folder) return res.status(404).json({ error: 'Folder tidak ditemukan' })
    await CustomFolder.deleteOne({ _id: folder._id })
    res.json({ success: true, message: 'Folder berhasil dihapus' })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.patch('/api/custom-folders/name/:nama', async (req, res) => {
  try {
    await ensureDB()
    const { nama_folder_baru } = req.body
    if (!req.params.nama || !nama_folder_baru) return res.status(400).json({ error: 'Nama folder lama dan baru wajib diisi' })
    const folder = await CustomFolder.findOne({ nama_folder: req.params.nama })
    if (!folder) return res.status(404).json({ error: 'Folder tidak ditemukan' })
    folder.nama_folder = nama_folder_baru
    await folder.save()
    res.json({ success: true, message: 'Folder berhasil diubah' })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

// ========== TANDA TANGAN ==========
app.get('/api/tanda-tangan', async (req, res) => {
  try {
    await ensureDB()
    const data = await TandaTanganDigital.find({ is_aktif: true }).populate('id_user')
    res.json({ success: true, data })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.post('/api/tanda-tangan', async (req, res) => {
  try {
    await ensureDB()
    const { id_user, file_ttd } = req.body
    if (!id_user || !file_ttd) return res.status(400).json({ error: 'Field wajib tidak lengkap' })
    const saved = await new TandaTanganDigital({ id_user, file_ttd, is_aktif: true }).save()
    res.json({ success: true, data: saved })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

// ========== REMINDERS ==========
app.get('/api/reminders', async (req, res) => {
  try {
    await ensureDB()
    const data = await Reminder.find().populate({ path: 'id_surat_masuk', populate: { path: 'id_surat_keluar_ref' } }).sort({ tanggal_batas: 1 })
    res.json({ success: true, data })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.post('/api/reminders', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { id_surat_masuk, tanggal_batas, keterangan } = req.body
    const saved = await new Reminder({ id_surat_masuk, tanggal_batas: new Date(tanggal_batas), status: 'menunggu', keterangan: keterangan || null }).save()
    res.json({ success: true, message: 'Reminder dibuat', data: saved })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.patch('/api/reminders/:id', authenticateToken, async (req, res) => {
  try {
    await ensureDB()
    const { status } = req.body
    const updated = await Reminder.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!updated) return res.status(404).json({ error: 'Reminder tidak ditemukan' })
    res.json({ success: true, message: 'Reminder diperbarui', data: updated })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.delete('/api/reminders/:id', async (req, res) => {
  try {
    await ensureDB()
    await Reminder.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Reminder dihapus' })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

// ========== OTP / PASSWORD RESET ==========
const otpStore = new Map()

app.post('/api/send-otp', otpLimiter, async (req, res) => {
  try {
    await ensureDB()
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Username wajib diisi' })
    const user = await Pengguna.findOne({ username, is_deleted: false })
    if (!user) return res.status(404).json({ error: 'Username tidak terdaftar' })
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    otpStore.set(username, { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 })
    res.json({ success: true, message: 'OTP telah dikirim' })
  } catch (error) { res.status(500).json({ error: 'Server error' }) }
})

app.post('/api/verify-otp', otpLimiter, async (req, res) => {
  const { username, otp } = req.body
  if (!username || !otp) return res.status(400).json({ error: 'Username dan OTP wajib diisi' })
  const stored = otpStore.get(username)
  if (!stored) return res.status(400).json({ error: 'OTP tidak ditemukan atau sudah kadaluarsa' })
  if (Date.now() > stored.expiresAt) { otpStore.delete(username); return res.status(400).json({ error: 'OTP sudah kadaluarsa' }) }
  if (stored.code !== otp) return res.status(400).json({ error: 'OTP tidak valid' })
  otpStore.delete(username)
  res.json({ success: true, message: 'OTP terverifikasi', token: username })
})

app.post('/api/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    await ensureDB()
    const { username, newPassword } = req.body
    if (!username || !newPassword) return res.status(400).json({ error: 'Username dan password baru wajib diisi' })
    const user = await Pengguna.findOne({ username, is_deleted: false })
    if (!user) return res.status(404).json({ success: false, error: 'Username tidak terdaftar' })
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password berhasil direset' })
  } catch (error) { res.status(500).json({ success: false, error: 'Server error' }) }
})

// SPA fallback for non-API routes
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
