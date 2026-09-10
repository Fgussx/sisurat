import mongoose from "mongoose"
import bcrypt from "bcryptjs"
const { Schema } = mongoose

// ==========================================
// 1. Role Schema
// ==========================================
const RoleSchema = new Schema(
  {
    nama_role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keterangan: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// ==========================================
// 2. Pengguna Schema
// ==========================================
const PenggunaSchema = new Schema(
  {
    id_role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // Simpan hasil hash bcrypt
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

PenggunaSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

PenggunaSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password)
}

// ==========================================
// 3. Format Nomor Surat Schema
// ==========================================
const FormatNomorSuratSchema = new Schema(
  {
    kode_surat: {
      type: String,
      required: true,
      trim: true,
    },
    pola_format: {
      type: String,
      required: true,
      // Contoh:
      // {nomor}/SSI-PCT/{bulan_romawi}/{tahun}
    },
    counter_terakhir: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// ==========================================
// 4. Tanda Tangan Digital Schema
// ==========================================
const TandaTanganDigitalSchema = new Schema(
  {
    id_user: {
      type: Schema.Types.ObjectId,
      ref: "Pengguna",
      required: true,
    },
    file_ttd: {
      nama: String,
      path: String,
      ukuran: Number,
      mime: String,
    },
    is_aktif: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// ==========================================
// 5. Surat Masuk Schema
// ==========================================
const SuratMasukSchema = new Schema(
  {
    id_user: {
      type: Schema.Types.ObjectId,
      ref: "Pengguna",
      required: true,
    },

    id_format: {
      type: Schema.Types.ObjectId,
      ref: "FormatNomorSurat",
      default: null,
    },

    id_surat_keluar_ref: {
      type: Schema.Types.ObjectId,
      ref: "SuratKeluar",
      default: null,
    },

    nomor_surat: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    pengirim: {
      type: String,
      required: true,
      trim: true,
    },

    folder: {
      type: String,
      default: null,
      trim: true,
    },

    perihal: {
      type: String,
      required: true,
      trim: true,
    },

    isi_surat: {
      type: String,
      default: '',
    },

    kategori: {
      type: String,
      enum: ["biasa", "penting"],
      default: "biasa",
    },

    jenis_surat: {
      type: String,
      default: "",
      trim: true,
    },

    tanggal_terima: {
      type: Date,
      required: true,
    },

    status_tindak_lanjut: {
      type: String,
      enum: ["tidak", "iya"],
      default: "tidak",
    },

    file_lampiran: {
      nama: String,
      path: String,
      ukuran: Number,
      mime: String,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// ==========================================
// 6. Surat Keluar Schema
// ==========================================
const SuratKeluarSchema = new Schema(
  {
    id_user: {
      type: Schema.Types.ObjectId,
      ref: "Pengguna",
      required: true,
    },

    id_format: {
      type: Schema.Types.ObjectId,
      ref: "FormatNomorSurat",
      default: null,
    },

    approved_by: {
      type: Schema.Types.ObjectId,
      ref: "Pengguna",
      default: null,
    },

    id_ttd: {
      type: Schema.Types.ObjectId,
      ref: "TandaTanganDigital",
      default: null,
    },

    id_surat_masuk_ref: {
      type: Schema.Types.ObjectId,
      ref: "SuratMasuk",
      default: null,
    },

    nomor_surat: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    tujuan: {
      type: String,
      required: true,
      trim: true,
    },

    folder: {
      type: String,
      default: null,
      trim: true,
    },

    perihal: {
      type: String,
      required: true,
      trim: true,
    },

    jenis_surat: {
      type: String,
      enum: ["surat tugas", "surat pemberitahuan", "surat perjanjian/kontrak", "surat undangan", "surat balasan", "surat edaran", "surat perintah", "surat rekomendasi", "surat izin", ""],
      default: "surat tugas",
    },

    isi_surat: {
      type: String,
      default: '',
    },

    kategori: {
      type: String,
      enum: ["biasa", "penting"],
      default: "biasa",
    },

    tanggal_kirim: {
      type: Date,
      required: true,
    },

    status_approval: {
      type: String,
      enum: ["menunggu", "disetujui", "ditolak"],
      default: "menunggu",
    },

    tanggal_approval: {
      type: Date,
      default: null,
    },

    catatan_revisi: {
      type: String,
      default: null,
    },

    file_draft: {
      nama: String,
      path: String,
      ukuran: Number,
      mime: String,
    },

    file_final_ttd: {
      nama: String,
      path: String,
      ukuran: Number,
      mime: String,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// ==========================================
// 7. Reminder Schema
// ==========================================
const ReminderSchema = new Schema(
  {
    id_surat_masuk: {
      type: Schema.Types.ObjectId,
      ref: "SuratMasuk",
      required: true,
    },

    tanggal_batas: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["menunggu", "selesai", "terlewat"],
      default: "menunggu",
    },

    keterangan: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// ==========================================
// 8. Custom Folder Schema
// ==========================================
const CustomFolderSchema = new Schema(
  {
    tipe_surat: {
      type: String,
      enum: ["masuk", "keluar"],
      required: true,
    },
    nama_folder: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

// ==========================================
// Index
// ==========================================

SuratMasukSchema.index({ tanggal_terima: -1 })
SuratMasukSchema.index({ status_tindak_lanjut: 1 })

SuratKeluarSchema.index({ tanggal_kirim: -1 })
SuratKeluarSchema.index({ status_approval: 1 })

// ==========================================
// Export Model
// ==========================================

export const Role = mongoose.model("Role", RoleSchema)
export const Pengguna = mongoose.model("Pengguna", PenggunaSchema)
export const FormatNomorSurat = mongoose.model(
  "FormatNomorSurat",
  FormatNomorSuratSchema,
)
export const TandaTanganDigital = mongoose.model(
  "TandaTanganDigital",
  TandaTanganDigitalSchema,
)
export const SuratMasuk = mongoose.model("SuratMasuk", SuratMasukSchema)
export const SuratKeluar = mongoose.model("SuratKeluar", SuratKeluarSchema)
export const Reminder = mongoose.model("Reminder", ReminderSchema)
export const CustomFolder = mongoose.model("CustomFolder", CustomFolderSchema)
