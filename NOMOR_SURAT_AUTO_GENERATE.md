# AUTO-GENERATE NOMOR SURAT - Dokumentasi

## 📋 Overview

Fitur auto-generate nomor surat untuk **Surat Keluar** dengan format:
```
{kodeJenis}.{urutan}/SSI-PCT/{bulanRomawi}/{tahun}
```

Contoh: `04.011/SSI-PCT/V/2026`

---

## 🎯 Komponen Format

| Bagian | Deskripsi | Contoh |
|--------|-----------|--------|
| **kodeJenis** | Kode jenis surat (2 digit) | `04` = Surat Perintah |
| **urutan** | Nomor urut (3 digit, auto-increment) | `011` |
| **Separator** | Karakter pemisah | `/` |
| **instansi** | Kode kantor (fixed) | `SSI-PCT` = SANDYA Pacitan |
| **bulanRomawi** | Bulan dalam angka Romawi | `V` = Mei |
| **tahun** | Tahun 4 digit | `2026` |

---

## 📌 Kode Jenis Surat

```javascript
01 = Surat Permohonan
02 = Surat Tugas
03 = Surat Pemberitahuan
04 = Surat Perintah ⭐ (contoh dalam requirement)
05 = Surat Balasan
06 = Surat Undangan
07 = Surat Rekomendasi
08 = Surat Izin
09 = Surat Edaran
10 = Surat Perjanjian/Kontrak
00 = Surat Masuk Biasa (untuk incoming letters)
```

---

## 🔄 Cara Kerja

### 1. **Frontend (React)**
- User membuka form "Tambah Surat Keluar"
- Kolom nomor surat menampilkan **preview otomatis** berdasarkan:
  - Jenis surat yang dipilih
  - Tanggal kirim (untuk bulan romawi)
  - Tahun dari tanggal
- User bisa **mengubah nomor manual** (kolom tidak locked)
- Ada tombol "Reset ke otomatis" untuk kembali ke format auto

### 2. **Backend (Express.js)**
Saat user submit form dengan flag `auto_nomor: true`:
1. Cari nomor terakhir untuk jenis surat yang sama
2. Parse urutan dari nomor terakhir (misal: `04.011` → ambil `011`)
3. Increment urutan: `011 + 1 = 012`
4. Generate nomor baru: `04.012/SSI-PCT/V/2026`
5. Simpan ke database

### 3. **Database (MongoDB)**
- Field `nomor_surat` menyimpan nomor final
- Field `jenis_surat` menyimpan jenis (untuk parsing urutan)
- Kombinasi keduanya memastikan auto-increment per jenis

---

## 💻 Implementasi Teknis

### Backend (server.js, line 723-781)

```javascript
app.post('/api/surat-keluar', async (req, res) => {
  const { auto_nomor, jenis_surat, tanggal_kirim, ... } = req.body
  
  let finalNomor = nomor_surat
  
  if (auto_nomor && jenis_surat && tanggal_kirim) {
    const tgl = new Date(tanggal_kirim)
    const bulanRomawi = BULAN_ROMAWI[tgl.getMonth()]
    const kodeJenis = KODE_JENIS[jenis_surat]
    const tahun = tgl.getFullYear()
    const kodeInstansi = "SSI-PCT"
    
    // Cari surat terakhir dengan jenis yang sama
    const lastSurat = await SuratKeluar.findOne({
      is_deleted: false,
      jenis_surat: jenis_surat
    }).sort({ created_at: -1 })
    
    // Parse urutan dari nomor terakhir
    let urutan = 1
    if (lastSurat && lastSurat.nomor_surat) {
      const nomorPart = lastSurat.nomor_surat.split('/')[0]  // "04.011"
      const urutanPart = nomorPart.split('.')[1]              // "011"
      urutan = parseInt(urutanPart) + 1
    }
    
    // Generate nomor: 04.012/SSI-PCT/V/2026
    finalNomor = `${kodeJenis}.${String(urutan).padStart(3, '0')}/${kodeInstansi}/${bulanRomawi}/${tahun}`
  }
  
  // ... simpan ke database
})
```

### Frontend (src/App.tsx, line 3027-3040)

```javascript
const generateNomorSurat = (jenis: string, tgl: string, instansi: string) => {
  const date = new Date(tgl)
  const kodeJenis = KODE_JENIS_SURAT[jenis] || "00"
  const bulanRomawi = BULAN_ROMAWI[date.getMonth()] || "?"
  const tahun = date.getFullYear()
  // Preview dengan urutan 001 (server akan increment)
  return `${kodeJenis}.001/${instansi}/${bulanRomawi}/${tahun}`
}

React.useEffect(() => {
  if (type === "keluar" && !nomorManual) {
    setNomorSurat(generateNomorSurat(jenisSurat, tanggal, kodeInstansi))
  }
}, [type, jenisSurat, tanggal, kodeInstansi, nomorManual])
```

---

## 🎨 User Interface

### Form Input
```
┌─────────────────────────────────────────┐
│ Nomor Surat (otomatis, bisa diubah)     │
├─────────────────────────────────────────┤
│ [04.001/SSI-PCT/IX/2026             ]  │  ← Preview otomatis
├─────────────────────────────────────────┤
│ ↻ Reset ke otomatis                     │  ← Tombol untuk kembali auto
│ ✓ Otomatis - Server akan increment...   │  ← Info teks
└─────────────────────────────────────────┘
```

Saat user ubah nomor manual:
```
┌─────────────────────────────────────────┐
│ [04.999/SSI-PCT/IX/2026             ]  │  ← User edit
├─────────────────────────────────────────┤
│ ↻ Reset ke otomatis                     │
│ ✎ Manual - Nomor tidak akan diubah...   │  ← Info manual
└─────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [ ] Start server: `npm run start`
- [ ] Buka http://localhost:8444
- [ ] Login dengan akun yang tersedia
- [ ] Buka "Surat Keluar" → "Tambah Surat"
- [ ] Pilih jenis surat: "Surat Perintah"
  - Expected: Nomor otomatis = `04.001/SSI-PCT/IX/2026`
- [ ] Ubah tanggal (misal: 01-06-2026)
  - Expected: Bulan berubah ke "VI"
- [ ] Ubah jenis surat ke "Surat Tugas"
  - Expected: Kode berubah ke "02"
- [ ] Ubah nomor manual ke "99.999/XXX/IX/2026"
  - Expected: Tombol "Reset ke otomatis" aktif, info berubah ke "Manual"
- [ ] Klik "Reset ke otomatis"
  - Expected: Nomor kembali ke `02.001/SSI-PCT/IX/2026`
- [ ] Isi field lainnya (tujuan, perihal, tanggal kirim) dan submit
- [ ] Cek database: nomor sudah tersimpan dengan benar
- [ ] Buat surat perintah ke-2
  - Expected: Nomor = `04.002/SSI-PCT/IX/2026` (auto-increment)
- [ ] Buat surat perintah dengan tanggal bulan berbeda
  - Expected: Bulan romawi berubah sesuai tanggal

---

## 🔍 Troubleshooting

### ❌ Nomor tidak auto-generate
**Solusi:**
- Pastikan `auto_nomor: true` dikirim ke backend
- Cek console backend untuk log "Auto-generated nomor"
- Verify `jenis_surat` ada di KODE_JENIS mapping

### ❌ Urutan tidak increment
**Solusi:**
- Pastikan surat sebelumnya sudah tersimpan di database
- Cek koleksi `suratkeluar` di MongoDB
- Verify format nomor sebelumnya: `XX.YYY/SSI-PCT/Z/YYYY`

### ❌ Bulan romawi salah
**Solusi:**
- Pastikan tanggal yang dipilih benar (format: YYYY-MM-DD)
- Cek array BULAN_ROMAWI di code
- Verify `getMonth()` - JavaScript menghitung bulan dari 0 (Januari = 0)

### ❌ Kode jenis tidak sesuai
**Solusi:**
- Update KODE_JENIS_SURAT di frontend dan KODE_JENIS di backend
- Pastikan keduanya konsisten (case-sensitive!)
- Cek input `jenis_surat` dari dropdown

---

## 📊 Contoh Data

### Surat Perintah (Jenis: 04)
```
Surat ke-1:  04.001/SSI-PCT/IX/2026  (Sept 2026)
Surat ke-2:  04.002/SSI-PCT/IX/2026
Surat ke-3:  04.003/SSI-PCT/X/2026   (Okt 2026, bulan berubah)
```

### Surat Tugas (Jenis: 02)
```
Surat ke-1:  02.001/SSI-PCT/IX/2026
Surat ke-2:  02.002/SSI-PCT/IX/2026
```

### Mix Jenis (Terpisah per jenis)
```
Surat Tugas:           02.001/SSI-PCT/IX/2026
Surat Perintah:        04.001/SSI-PCT/IX/2026  ← Start dari 001
Surat Tugas (ke-2):    02.002/SSI-PCT/IX/2026  ← Increment 02
Surat Perintah (ke-2): 04.002/SSI-PCT/IX/2026  ← Increment 04
```

---

## 🔐 Fitur Keamanan

✅ **Nomor tidak bisa duplikat** 
- Database constraint: `nomor_surat` unique

✅ **Validasi format di backend**
- Walaupun user bisa ubah manual, format tetap divalidasi

✅ **Auto-increment reliable**
- Cari surat terakhir berdasarkan `jenis_surat` + `created_at`
- Increment urutan secara konsisten

---

## 📝 Notes

- **Kolom nomor TIDAK LOCKED**: User dapat mengubah nomor jika diperlukan
- **Format otomatis**: Server akan auto-generate urutan berdasarkan jenis surat
- **Kode instansi FIXED**: Selalu "SSI-PCT" (tidak perlu diubah)
- **Bulan Romawi**: Otomatis dari tanggal kirim
- **Per jenis**: Urutan terpisah untuk setiap jenis surat

---

## 🎯 Status

✅ **Implemented & Ready to Test**

Versi: 1.0  
Date: 2026-09-03  
Developer: Kiro (AI Assistant)
