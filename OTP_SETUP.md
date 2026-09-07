# Fitur OTP Reset Password - SiSurat

## Setup

### 1. Konfigurasi Email (Gmail)

Edit file `.env` dan masukkan kredensial Gmail Anda:

```
EMAIL_USER=cssandya3@gmail.com
EMAIL_PASSWORD=kgwv buwq ptkb rqay
PORT=5000
```

**Cara mendapatkan App Password Gmail:**
1. Buka https://myaccount.google.com/security
2. Aktifkan "2-Step Verification" jika belum
3. Kembali ke Security dan cari "App passwords"
4. Pilih Mail dan Windows Computer
5. Copy password yang diberikan ke `.env`

### 2. Install Dependencies

```bash
npm install nodemailer express @types/nodemailer @types/express dotenv ts-node
```

### 3. Jalankan Server

Buka terminal terpisah dan jalankan:

```bash
npm run server
```

Server akan berjalan di `http://localhost:5000`

## Fitur

### Step 1: Masukkan Email
- User memasukkan email yang terdaftar
- Klik "Kirim OTP"
- Server mengirim OTP ke email (berlaku 10 menit)

### Step 2: Verifikasi OTP
- User menerima email berisi kode OTP 6 digit
- Masukkan kode ke form
- Klik "Verifikasi OTP"

### Step 3: Reset Password
- User memasukkan password baru
- Konfirmasi password harus cocok
- Klik "Simpan Password Baru"
- Jika berhasil, akan diarahkan ke halaman login

## API Endpoints

### POST /api/send-otp
Mengirim OTP ke email user

```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP telah dikirim ke email Anda"
}
```

### POST /api/verify-otp
Verifikasi kode OTP

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP terverifikasi",
  "token": "user@example.com"
}
```

### POST /api/reset-password
Reset password user

```json
{
  "email": "user@example.com",
  "newPassword": "password-baru"
}
```

Response:
```json
{
  "success": true,
  "message": "Password berhasil direset"
}
```

## File Struktur

```
server/
├── index.ts          # Express server & API routes
├── mailer.ts         # Nodemailer configuration & email sender
.env                  # Environment variables
```

## Testing

1. Login ke SiSurat dengan admin/admin123
2. Klik "Lupa Password?"
3. Masukkan email test
4. Lihat OTP di email
5. Verifikasi OTP
6. Masukkan password baru
7. Login dengan password baru
