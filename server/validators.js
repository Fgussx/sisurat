import joi from 'joi'

// ==========================================
// Auth Validators
// ==========================================

export const loginSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'string.min': 'Username minimal 3 karakter',
    'string.max': 'Username maksimal 30 karakter',
    'any.required': 'Username wajib diisi',
  }),
  password: joi.string().min(8).required().messages({
    'string.min': 'Password minimal 8 karakter',
    'any.required': 'Password wajib diisi',
  }),
})

export const sendOtpSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'string.min': 'Username minimal 3 karakter',
    'any.required': 'Username wajib diisi',
  }),
})

export const verifyOtpSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'any.required': 'Username wajib diisi',
  }),
  otp: joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP harus 6 digit',
    'string.pattern.base': 'OTP harus numeric',
    'any.required': 'OTP wajib diisi',
  }),
})

export const resetPasswordSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'any.required': 'Username wajib diisi',
  }),
  newPassword: joi.string().min(8).required().messages({
    'string.min': 'Password minimal 8 karakter',
    'any.required': 'Password wajib diisi',
  }),
})

export const changePasswordSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'any.required': 'Username wajib diisi',
  }),
  newPassword: joi.string().min(8).required().messages({
    'string.min': 'Password minimal 8 karakter',
    'any.required': 'Password wajib diisi',
  }),
})

// ==========================================
// User Management Validators
// ==========================================

export const createUserSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'string.min': 'Username minimal 3 karakter',
    'any.required': 'Username wajib diisi',
  }),
  password: joi.string().min(8).required().messages({
    'string.min': 'Password minimal 8 karakter',
    'any.required': 'Password wajib diisi',
  }),
  nama: joi.string().max(100).required().messages({
    'string.max': 'Nama maksimal 100 karakter',
    'any.required': 'Nama wajib diisi',
  }),
  email: joi.string().email().required().messages({
    'string.email': 'Email tidak valid',
    'any.required': 'Email wajib diisi',
  }),
  id_role: joi.string().required().messages({
    'any.required': 'Role wajib diisi',
  }),
})

export const updateUserSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'any.required': 'Username wajib diisi',
  }),
  newUsername: joi.string().alphanum().min(3).max(30).optional().messages({
    'string.alphanum': 'Username baru harus alphanumeric',
  }),
  newNama: joi.string().max(100).optional().messages({
    'string.max': 'Nama maksimal 100 karakter',
  }),
  id_role: joi.string().optional(),
})

export const deleteUserSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username harus alphanumeric',
    'any.required': 'Username wajib diisi',
  }),
})

// ==========================================
// Surat Masuk Validators
// ==========================================

export const createSuratMasukSchema = joi.object({
  nomor_surat: joi.string().required().messages({
    'any.required': 'Nomor surat wajib diisi',
  }),
  pengirim: joi.string().required().messages({
    'any.required': 'Pengirim wajib diisi',
  }),
  perihal: joi.string().required().messages({
    'any.required': 'Perihal wajib diisi',
  }),
  tanggal_terima: joi.date().required().messages({
    'date.base': 'Tanggal terima tidak valid',
    'any.required': 'Tanggal terima wajib diisi',
  }),
  isi_surat: joi.string().allow('').optional(),
  kategori: joi.string().valid('biasa', 'penting').optional().messages({
    'any.only': 'Kategori harus biasa atau penting',
  }),
  jenis_surat: joi.string().allow('').optional(),
  folder: joi.string().allow(null).optional(),
  file_lampiran: joi.object().optional(),
})

export const updateSuratMasukSchema = joi.object({
  perihal: joi.string().required().messages({
    'any.required': 'Perihal wajib diisi',
  }),
  isi_surat: joi.string().allow('').optional(),
  kategori: joi.string().valid('biasa', 'penting').optional().messages({
    'any.only': 'Kategori harus biasa atau penting',
  }),
  folder: joi.string().allow(null).optional(),
  nomor_surat: joi.string().optional(),
  pengirim: joi.string().optional(),
  tanggal_terima: joi.date().optional(),
  jenis_surat: joi.string().allow('').optional(),
  id_surat_keluar_ref: joi.string().optional(),
})

export const updateSuratMasukStatusSchema = joi.object({
  status_tindak_lanjut: joi.string().valid('tidak', 'iya').optional().messages({
    'any.only': 'Status harus tidak atau iya',
  }),
  id_surat_keluar_ref: joi.string().optional(),
})

// ==========================================
// Surat Keluar Validators
// ==========================================

export const createSuratKeluarSchema = joi.object({
  nomor_surat: joi.string().optional(),
  tujuan: joi.string().required().messages({
    'any.required': 'Tujuan wajib diisi',
  }),
  perihal: joi.string().required().messages({
    'any.required': 'Perihal wajib diisi',
  }),
  tanggal_kirim: joi.date().required().messages({
    'date.base': 'Tanggal kirim tidak valid',
    'any.required': 'Tanggal kirim wajib diisi',
  }),
  jenis_surat: joi.string().optional(),
  isi_surat: joi.string().allow('').optional(),
  kategori: joi.string().valid('biasa', 'penting').optional().messages({
    'any.only': 'Kategori harus biasa atau penting',
  }),
  folder: joi.string().allow(null).optional(),
  file_draft: joi.object().optional(),
  auto_nomor: joi.boolean().optional(),
  id_surat_masuk_ref: joi.string().optional(),
})

export const updateSuratKeluarSchema = joi.object({
  perihal: joi.string().required().messages({
    'any.required': 'Perihal wajib diisi',
  }),
  jenis_surat: joi.string().optional(),
  isi_surat: joi.string().allow('').optional(),
  kategori: joi.string().valid('biasa', 'penting').optional().messages({
    'any.only': 'Kategori harus biasa atau penting',
  }),
  folder: joi.string().allow(null).optional(),
  file_draft: joi.object().optional(),
  nomor_surat: joi.string().optional(),
  tujuan: joi.string().optional(),
  tanggal_kirim: joi.date().optional(),
  file_final_ttd: joi.object().optional(),
  id_ttd: joi.string().optional(),
})

export const updateSuratKeluarApprovalSchema = joi.object({
  status_approval: joi.string().valid('menunggu', 'disetujui', 'ditolak').required().messages({
    'any.only': 'Status approval harus menunggu, disetujui, atau ditolak',
    'any.required': 'Status approval wajib diisi',
  }),
  approved_by: joi.string().optional(),
  catatan_revisi: joi.string().optional(),
})

// ==========================================
// Reminder Validators
// ==========================================

export const createReminderSchema = joi.object({
  id_surat_masuk: joi.string().required().messages({
    'any.required': 'ID surat masuk wajib diisi',
  }),
  tanggal_batas: joi.date().required().messages({
    'date.base': 'Tanggal batas tidak valid',
    'any.required': 'Tanggal batas wajib diisi',
  }),
  keterangan: joi.string().optional(),
})

export const updateReminderSchema = joi.object({
  status: joi.string().valid('menunggu', 'selesai', 'terlewat').required().messages({
    'any.only': 'Status harus menunggu, selesai, atau terlewat',
    'any.required': 'Status wajib diisi',
  }),
})

// ==========================================
// Custom Folder Validators
// ==========================================

export const createCustomFolderSchema = joi.object({
  tipe_surat: joi.string().valid('masuk', 'keluar').required().messages({
    'any.only': 'Tipe surat harus masuk atau keluar',
    'any.required': 'Tipe surat wajib diisi',
  }),
  nama_folder: joi.string().required().messages({
    'any.required': 'Nama folder wajib diisi',
  }),
})

export const updateCustomFolderSchema = joi.object({
  nama_folder_baru: joi.string().required().messages({
    'any.required': 'Nama folder baru wajib diisi',
  }),
})

// ==========================================
// Tanda Tangan Digital Validators
// ==========================================

export const createTandaTanganSchema = joi.object({
  id_user: joi.string().required().messages({
    'any.required': 'ID user wajib diisi',
  }),
  file_ttd: joi.object().required().messages({
    'any.required': 'File TTD wajib diisi',
  }),
})

// ==========================================
// Role Validators
// ==========================================

export const createRoleSchema = joi.object({
  nama_role: joi.string().required().messages({
    'any.required': 'Nama role wajib diisi',
  }),
  keterangan: joi.string().optional(),
})
