# Form "Tambah Surat Keluar" - Dokumentasi

## Informasi Umum
- **Nama Form**: Tambah Surat Keluar
- **Tipe**: Modal/Pop-up Dialog
- **Aplikasi**: Sistem Manajemen Persuratan Digital (SiSurat)
- **Akses**: Menu Surat Keluar → Button "Tambah Surat"
- **User**: Admin, Staff, Kepala Bagian

---

## Layout & Struktur

```
┌─────────────────────────────────────────────────────────┐
│ Tambah Surat Keluar                                [✕] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Nomor Surat *                                         │
│  [Input: Contoh: 001/SSI-PCT/08/2026________________]  │
│                                                         │
│  Tanggal Kirim *                                       │
│  [Date Picker: YYYY-MM-DD_________]                   │
│                                                         │
│  Tujuan *                                              │
│  [Input: Nama instansi tujuan_________________]        │
│                                                         │
│  Pilih Folder (Opsional)                              │
│  [Dropdown: -- Pilih Folder --▼]                      │
│                                                         │
│  Perihal *                                             │
│  [Input: Perihal surat________________]               │
│                                                         │
│  Isi Surat                                             │
│  [Textarea: Masukkan isi surat...                 ]   │
│  [                                                   ]   │
│  [                                                   ]   │
│                                                         │
│  Kategori                                              │
│  [Dropdown: Biasa▼]                                   │
│    - Biasa                                             │
│    - Penting                                           │
│                                                         │
│  Jenis Surat                                           │
│  [Dropdown: Surat Tugas▼]                             │
│    - Surat Tugas                                       │
│    - Surat Pemberitahuan                               │
│    - Surat Perjanjian/Kontrak                          │
│                                                         │
│  Unggah File PDF (maks. 1,5 MB) - Opsional           │
│  [📎 Pilih File...] atau Drag & Drop                 │
│                                                         │
│  [Buat Surat Keluar]  [Batal]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Daftar Input Field

### 1. Nomor Surat
- **Tipe**: Text Input
- **Required**: ✅ Ya
- **Placeholder**: `001/SSI-PCT/08/2026`
- **Format**: Bebas (alphanumeric + special chars)
- **Validasi**: 
  - Wajib diisi
  - Harus unik (tidak boleh duplikat)
  - Max length: 50 karakter
- **Error Message**: "Nomor surat sudah ada" / "Field wajib diisi"

### 2. Tanggal Kirim
- **Tipe**: Date Picker (HTML5 date input)
- **Required**: ✅ Ya
- **Format**: YYYY-MM-DD
- **Default**: Kosong (user pilih)
- **Validasi**: Wajib diisi
- **Range**: Bisa tanggal masa lalu/mendatang

### 3. Tujuan
- **Tipe**: Text Input
- **Required**: ✅ Ya
- **Placeholder**: `Nama instansi tujuan`
- **Contoh**: "SMKN 1 Pacitan", "Dinas Pendidikan", "PT Maju Jaya"
- **Validasi**: Wajib diisi
- **Max length**: 100 karakter

### 4. Pilih Folder
- **Tipe**: Dropdown Select
- **Required**: ❌ Opsional
- **Default**: `-- Pilih Folder --`
- **Options**: Dynamic dari database (custom folders yang user buat)
- **Contoh Options**:
  - SMKN 1 PACITAN
  - DINAS PENDIDIKAN
  - KEPALA SEKOLAH
  - PT SWASTA
- **Validasi**: Tidak ada (opsional)

### 5. Perihal
- **Tipe**: Text Input
- **Required**: ✅ Ya
- **Placeholder**: `Perihal surat`
- **Contoh**: "Surat balasan untuk permohonan siswa PKL"
- **Validasi**: Wajib diisi
- **Max length**: 200 karakter

### 6. Isi Surat
- **Tipe**: Textarea (Multi-line text)
- **Required**: ❌ Opsional
- **Placeholder**: `Masukkan isi surat...`
- **Rows**: 4 baris
- **Validasi**: Tidak ada (bisa kosong)
- **Max length**: 5000 karakter
- **Features**: Preserve line breaks, wrap text

### 7. Kategori
- **Tipe**: Dropdown Select
- **Required**: ❌ Opsional
- **Default**: `Biasa`
- **Options**:
  - Biasa (warna: abu-abu)
  - Penting (warna: merah)
- **Validasi**: Tidak ada
- **UI**: Color indicator dot

### 8. Jenis Surat
- **Tipe**: Dropdown Select
- **Required**: ❌ Opsional
- **Default**: `Surat Tugas`
- **Options**:
  - Surat Tugas
  - Surat Pemberitahuan
  - Surat Perjanjian/Kontrak
- **Validasi**: Tidak ada

### 9. Unggah File PDF
- **Tipe**: File Input (Upload)
- **Required**: ❌ Opsional
- **Accepted Format**: `.pdf` only
- **Max Size**: 1.5 MB
- **Placeholder**: `Pilih File...`
- **UI**: 
  - Icon: 📎
  - Support Drag & Drop
  - Show file name after selected
- **Validasi**:
  - Harus PDF (ekstension dan mime type)
  - Max 1.5 MB
  - Error: "Ukuran file maksimal 1,5 MB"

---

## Tombol Aksi

### 1. "Buat Surat Keluar" / "Tambah Surat Keluar"
- **Tipe**: Primary Button (warna biru)
- **Background**: `#2563EB`
- **Text Color**: Putih
- **State**:
  - Normal: Clickable
  - Loading: "Membuat..." + disabled
  - Success: "Akun Dibuat ✓" (temporary)
- **Action**: Submit form
- **Validasi**: Jalankan validasi sebelum submit

### 2. "Batal"
- **Tipe**: Secondary Button (border + outline)
- **Background**: `#FFF5F5` (light red)
- **Border**: `#FECACA` (red)
- **Text Color**: `#DC2626` (red)
- **Hover**: Background jadi `#FEE2E2`
- **Action**: Close modal tanpa save

---

## Validasi & Error Handling

### Validasi Wajib Diisi
```
Jika user tidak mengisi field wajib dan klik "Buat Surat Keluar":
- Error message: "Semua field wajib diisi"
- Form tidak di-submit
- Highlight field yang kosong (optional)
```

### Validasi File
```
Jika file bukan PDF:
- Error: "File harus berformat PDF"

Jika file > 1.5 MB:
- Error: "Ukuran file maksimal 1,5 MB"
```

### Validasi Nomor Surat Duplikat
```
Jika nomor surat sudah ada di database:
- Error: "Nomor surat sudah ada"
- Form tidak di-submit
```

### Validasi Server Error
```
Jika server error:
- Error: "Koneksi ke server gagal"
- Form tetap terbuka
- User bisa retry atau cancel
```

---

## Flow & Behavior

### 1. Modal Muncul
```
1. User klik "Tambah Surat" di halaman Surat Keluar
2. Modal dialog terbuka dengan overlay semi-transparent
3. Semua field kosong (except default values)
4. Focus ke field pertama (Nomor Surat)
```

### 2. User Mengisi Form
```
1. User mengisi field yang diperlukan
2. Isi surat & file PDF opsional
3. User bisa upload file dengan klik atau drag & drop
```

### 3. User Submit
```
1. Klik "Buat Surat Keluar"
2. Frontend validasi semua field
3. Jika ada error: tampilkan error message
4. Jika valid: button jadi loading ("Membuat...")
5. Kirim ke server POST /api/surat-keluar
```

### 4. Server Response
```
Success (200):
- Button berubah "Akun Dibuat ✓"
- Tunggu 800ms
- Modal close
- Refresh daftar surat keluar

Error (400/500):
- Button kembali normal
- Tampilkan error message dari server
- Modal tetap terbuka
```

### 5. Modal Close
```
User bisa close modal dengan:
1. Klik "Batal" button
2. Klik icon X (top-right)
3. Klik di luar modal (overlay)
4. Submit berhasil (auto close)
```

---

## Data yang Dikirim ke Server

### POST /api/surat-keluar

```json
{
  "id_user": "6a793d753cc2dfc189eea090",
  "nomor_surat": "001/SSI-PCT/08/2026",
  "tujuan": "SMKN 1 Pacitan",
  "folder": "SMKN 1 PACITAN",
  "perihal": "Surat balasan untuk permohonan siswa PKL",
  "jenis_surat": "surat tugas",
  "isi_surat": "Dengan hormat, kami menerima permohonan anda...",
  "kategori": "penting",
  "tanggal_kirim": "2026-08-21T00:00:00.000Z",
  "file_draft": {
    "nama": "draft_001.pdf",
    "path": "/uploads/1692567890_draft_001.pdf",
    "ukuran": 45000,
    "mime": "application/pdf"
  }
}
```

---

## Response Database (SuratKeluar)

```json
{
  "_id": ObjectId("6a880021eff6dd0d4a239143"),
  "id_user": ObjectId("6a793d753cc2dfc189eea090"),
  "nomor_surat": "001/SSI-PCT/08/2026",
  "tujuan": "SMKN 1 Pacitan",
  "folder": "SMKN 1 PACITAN",
  "perihal": "Surat balasan untuk permohonan siswa PKL",
  "jenis_surat": "surat tugas",
  "isi_surat": "Dengan hormat, kami menerima permohonan anda...",
  "kategori": "penting",
  "tanggal_kirim": ISODate("2026-08-21T00:00:00.000Z"),
  "status_approval": "menunggu",
  "file_draft": {
    "nama": "draft_001.pdf",
    "path": "/uploads/1692567890_draft_001.pdf",
    "ukuran": 45000,
    "mime": "application/pdf"
  },
  "is_deleted": false,
  "created_at": ISODate("2026-08-21T07:58:58.527Z"),
  "updated_at": ISODate("2026-08-21T07:58:58.527Z")
}
```

---

## Styling & CSS Classes

- Modal Background: `#0F172A` opacity 50%
- Modal Box: White background, rounded-2xl, shadow-xl
- Input Border: `#E0E0E0` (gray-200)
- Input Focus: Blue border + ring
- Button Primary: `#2563EB` (blue-600)
- Button Secondary: Red theme
- Label: Text xs, medium weight, text-slate-600
- Placeholder: Text-slate-400

---

## Accessibility

- ✅ Form labels ter-associate dengan input (for/id)
- ✅ Required field ditandai dengan *
- ✅ Error message accessible
- ✅ Keyboard navigation support
- ✅ Focus management (focus ke field pertama)
- ✅ Modal dismissible dengan ESC key

---

## Browser Compatibility

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

---

## File Location in Code

- **Component**: `src/App.tsx` lines 2853-3300 (ModalTambahSurat function)
- **API Endpoint**: `server.js` line 676 (POST /api/surat-keluar)
- **Database Schema**: `models.js` lines 223-337 (SuratKeluarSchema)

---

**Dokumentasi ini dibuat**: 2026-08-21
**Last Updated**: 2026-08-21 08:38:53 UTC
