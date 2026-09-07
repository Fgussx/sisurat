import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
})

export async function sendOTP(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password OTP - SiSurat',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0F172A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2>Reset Password</h2>
          </div>
          <div style="background: #F5F5F5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Kami menerima permintaan untuk mengatur ulang password akun Anda.
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
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { success: false, error: 'Gagal mengirim OTP' }
  }
}
