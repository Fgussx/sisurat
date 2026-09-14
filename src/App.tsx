import React, { useState } from "react"
import logoSandya from "./assets/logo-sandya.png"
import bubleSurat from "./assets/buble-surat.png"
import bubleOrang from "./assets/orang.png"
import ttdImage from "./assets/ttd.png"
import { EditSuratPage } from "./EditSuratPage"
import { usePasswordValidation, usePasswordMatch } from "./hooks/usePasswordValidation"
import { PasswordValidationLabel } from "./components/PasswordValidationLabel"

const API_BASE = ""

type Page = "login" | "lupa-password" | "dashboard" | "surat-masuk" | "surat-keluar" | "manajemen-akun" | "master-data" | "edit-surat" | "tambah-surat-keluar" | "success"

const currentMonthKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const inMonth = (dateStr: string | undefined, month: string) => {
  const t = dateStr ? new Date(dateStr) : null
  if (!t || isNaN(t.getTime())) return false
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}` === month
}

// ── Nomor Surat Auto-Generate Helpers ────────────────────────────────────────
// Format: {kodeJenis}.{urutan}/SSI-PCT/{bulanRomawi}/{tahun}
// Contoh: 04.011/SSI-PCT/V/2026 (Surat Perintah nomor 11, Mei 2026)
const KODE_JENIS_SURAT: Record<string, string> = {
  "surat permohonan": "01",        // 01 = Surat Permohonan
  "surat tugas": "02",              // 02 = Surat Tugas
  "surat pemberitahuan": "03",      // 03 = Surat Pemberitahuan
  "surat perintah": "04",           // 04 = Surat Perintah (sesuai contoh)
  "surat balasan": "05",            // 05 = Surat Balasan
  "surat undangan": "06",           // 06 = Surat Undangan
  "surat rekomendasi": "07",        // 07 = Surat Rekomendasi
  "surat izin": "08",               // 08 = Surat Izin
  "surat edaran": "09",             // 09 = Surat Edaran
  "surat perjanjian/kontrak": "10", // 10 = Surat Perjanjian/Kontrak
  "surat masuk biasa": "00",        // 00 = Surat Masuk Biasa
}

const JENIS_SURAT_OPTIONS_MASUK = [
  { value: "", label: "-- Pilih Jenis Surat --" },
  { value: "surat masuk biasa", label: "Surat Masuk Biasa" },
  { value: "surat undangan", label: "Surat Undangan" },
  { value: "surat pemberitahuan", label: "Surat Pemberitahuan" },
  { value: "surat tugas", label: "Surat Tugas" },
  { value: "surat perintah", label: "Surat Perintah" },
  { value: "surat rekomendasi", label: "Surat Rekomendasi" },
  { value: "surat izin", label: "Surat Izin" },
]

const JENIS_SURAT_OPTIONS_KELUAR = [
  { value: "surat tugas", label: "Surat Tugas" },
  { value: "surat pemberitahuan", label: "Surat Pemberitahuan" },
  { value: "surat balasan", label: "Surat Balasan" },
  { value: "surat undangan", label: "Surat Undangan" },
  { value: "surat perintah", label: "Surat Perintah" },
  { value: "surat rekomendasi", label: "Surat Rekomendasi" },
  { value: "surat izin", label: "Surat Izin" },
  { value: "surat edaran", label: "Surat Edaran" },
  { value: "surat perjanjian/kontrak", label: "Surat Perjanjian/Kontrak" },
]

const BULAN_ROMAWI = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

function getMasterData(key: string, fallback: string[]): string[] {
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : fallback
}

function getJenisSuratMasukOptions() {
  return getMasterData("master_jenis_masuk", ["surat masuk biasa", "surat undangan", "surat pemberitahuan", "surat tugas", "surat perintah", "surat rekomendasi", "surat izin"])
}

function getJenisSuratKeluarOptions() {
  return getMasterData("master_jenis_keluar", ["surat tugas", "surat pemberitahuan", "surat balasan", "surat undangan", "surat perintah", "surat rekomendasi", "surat izin", "surat edaran", "surat perjanjian/kontrak"])
}

function getKategoriOptions() {
  return getMasterData("master_kategori", ["biasa", "penting"])
}

// ── Icons ──────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)
/*const IconInbox = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)
const IconOutbox = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)**/
const IconLogout = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const IconInbox = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)
const IconUsers = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconMail = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const IconMailIn = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
    <polyline points="12 13 12 19" />
    <polyline points="9 16 12 19 15 16" />
  </svg>
)
const IconMailOut = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
    <polyline points="12 13 12 19" />
    <polyline points="9 16 12 13 15 16" />
  </svg>
)
const IconMailStack = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    <polyline points="22,6 12,13 2,6" />
    <path d="M8 20h8" />
  </svg>
)
const IconPaperPlane = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)
const IconSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const IconFolder = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)
const IconFolderOpen = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 3h9a2 2 0 0 1 2 2v1" />
    <path d="M3 15l3-3h14l-3 8H3l3-8z" />
  </svg>
)
const IconChevronRight = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const IconAllMail = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const IconMinus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const IconPlus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconBell = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const IconEye = ({ open }: { open?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
)
const IconPanelLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
)
const IconPanelRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
)

// ── Login Page ──────────────────────────────────────────────────────────────
function LoginPage({
  onLogin,
  onLupaPassword,
}: {
  onLogin: (user?: { id?: string; nama?: string; role?: string | null }) => void
  onLupaPassword: () => void
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const passwordValidation = usePasswordValidation(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!username || !password) {
      setError("Username dan password wajib diisi.")
      return
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (response.ok) {
        onLogin(data.user)
      } else {
        setError(data.error || "Username atau password salah.")
        setLoading(false)
      }
    } catch (err) {
      setError("Koneksi ke server gagal.")
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, sans-serif", background: "#FFFFFF" }}
    >
      <div
        className="flex w-full max-w-6xl rounded-3xl overflow-hidden border border-slate-700"
        style={{
          background: "white",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(30, 41, 59, 0.1)",
        }}
      >
        {/* Left panel dengan branding */}
        <div
          className="hidden lg:flex flex-col justify-between w-1/2 flex-shrink-0 p-12"
          style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center border-2"
                style={{
                  borderColor: "#60A5FA",
                  background: "transparent",
                  position: "relative",
                  top: "0",
                  left: "0",
                }}
              >
                <IconMail
                  style={{ color: "#60A5FA", width: "26px", height: "22px" }}
                />
              </div>
              <span
                className="font-semibold text-lg tracking-tight"
                style={{
                  color: "#F8F9FA",
                  fontSize: "22px",
                  position: "relative",
                  top: "0",
                  left: "0",
                }}
              >
                SiSurat
              </span>
            </div>
            <p className="text-sm mt-3" style={{ color: "#94A3B8", lineHeight: "1.6" }}>
              Sistem Manajemen Surat Digital
            </p>
          </div>

          <div className="flex flex-col items-center justify-center flex-1">
            <img
              src={logoSandya}
              alt="SANDYA Networks"
              className="mb-6 h-auto"
              style={{
                maxWidth: "170px",
                position: "relative",
                bottom: "110px",
                left: "150px",
                zIndex: "1",
              }}
            />
            <div
              className="flex items-flex-end justify-between w-full"
              style={{
                height: "140px",
                position: "relative",
              }}
            >
              <img
                src={bubleSurat}
                alt="Surat"
                className="h-auto"
                style={{
                  width: "80px",
                  objectFit: "contain",
                  position: "absolute",
                  bottom: "80px",
                  left: "110px",
                }}
              />
              <img
                src={bubleOrang}
                alt="Orang"
                className="h-auto"
                style={{
                  width: "190px",
                  objectFit: "contain",
                  position: "absolute",
                  top: "30px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right panel login */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: "#0F172A" }}
              >
                Login
              </h2>
              <p className="text-sm" style={{ color: "#64748B" }}>
                Masuk ke akun Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#334155" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full px-4 py-3 rounded-xl border text-slate-900 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    borderColor: "#E2E8F0",
                    background: "white",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#334155" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-4 py-3 rounded-xl border text-slate-900 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pr-12 shadow-sm"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      borderColor: "#E2E8F0",
                      background: "white",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-200"
                    style={{ color: "#94A3B8" }}
                    title={showPassword ? "Sembunyikan password" : "Lihat password"}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#F1F5F9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <IconEye open={showPassword} />
                  </button>
                </div>
                <PasswordValidationLabel
                  message={passwordValidation.message}
                  color={passwordValidation.color}
                  icon={passwordValidation.icon}
                  isEmpty={passwordValidation.isEmpty}
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={onLupaPassword}
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: "#2563EB" }}
                >
                  Lupa Password?
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: loading ? "#93C5FD" : "linear-gradient(135deg, #3B82F6, #2563EB)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p className="text-center text-xs mt-8 pt-6" style={{ color: "#64748B", borderTop: "1px solid #E2E8F0" }}>
              © 2024 SiSurat — Sistem Manajemen Surat Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Lupa Password ───────────────────────────────────────────────────────────
function LupaPasswordPage({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"username" | "otp" | "reset">("username")
  const [username, setUsername] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const newPasswordValidation = usePasswordValidation(newPassword)
  const confirmPasswordValidation = usePasswordMatch(newPassword, confirmPassword)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      setError("Username wajib diisi")
      return
    }
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      const data = await response.json()
      if (response.ok) {
        setStep("otp")
        setError("")
      } else {
        setError(data.error || "Gagal mengirim OTP")
      }
    } catch (err) {
      setError("Koneksi ke server gagal")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      setError("OTP wajib diisi")
      return
    }
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp }),
      })
      const data = await response.json()
      if (response.ok) {
        setStep("reset")
        setError("")
      } else {
        setError(data.error || "OTP tidak valid")
      }
    } catch (err) {
      setError("Koneksi ke server gagal")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      setError("Password baru wajib diisi")
      return
    }
    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setTimeout(() => onBack(), 2000)
      } else {
        setError(data.error || "Gagal mereset password")
      }
    } catch (err) {
      setError("Koneksi ke server gagal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "Inter, sans-serif", background: "#F1F5F9" }}
    >
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ background: "#0F172A" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "#2563EB" }}
            >
              <IconMail />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              SiSurat
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Reset
            <br />
            Password Anda
          </h1>
          <p
            className="text-slate-400 leading-relaxed"
            style={{ fontSize: "0.9375rem" }}
          >
            Masukkan username Anda yang terdaftar. Kami akan mengirimkan kode OTP untuk mengatur ulang password Anda.
          </p>
        </div>
        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-slate-400 text-sm leading-relaxed">
            Jika Anda tidak menerima OTP dalam 5 menit, periksa folder spam
            atau hubungi administrator sistem.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
            {success ? (
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "#ECFDF5" }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Password Berhasil Direset!
                </h2>
                <p className="text-slate-500 text-sm">
                  Anda akan diarahkan ke halaman login dalam beberapa detik.
                </p>
              </div>
            ) : step === "username" ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Lupa Password?
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Masukkan username untuk menerima kode OTP
                  </p>
                </div>
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username Anda"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !username}
                    className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
                    style={{
                      background: loading || !username ? "#93C5FD" : "#2563EB",
                      cursor: loading || !username ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Mengirim..." : "Kirim OTP"}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={onBack}
                    className="text-sm font-medium"
                    style={{ color: "#2563EB" }}
                  >
                    ← Kembali ke Login
                  </button>
                </div>
              </>
            ) : step === "otp" ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Verifikasi OTP
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Masukkan kode OTP yang telah dikirim untuk {username}
                  </p>
                </div>
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Masukkan 6 digit OTP"
                      maxLength={6}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !otp}
                    className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
                    style={{
                      background: loading || !otp ? "#93C5FD" : "#2563EB",
                      cursor: loading || !otp ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Verifikasi..." : "Verifikasi OTP"}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep("username")}
                    className="text-sm font-medium"
                    style={{ color: "#2563EB" }}
                  >
                    ← Kembali
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Password Baru
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Masukkan password baru Anda
                  </p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <PasswordValidationLabel
                      message={newPasswordValidation.message}
                      color={newPasswordValidation.color}
                      icon={newPasswordValidation.icon}
                      isEmpty={newPasswordValidation.isEmpty}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password baru"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <PasswordValidationLabel
                      message={confirmPasswordValidation.message}
                      color={confirmPasswordValidation.color}
                      icon={confirmPasswordValidation.icon}
                      isEmpty={confirmPasswordValidation.isEmpty}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
                    style={{
                      background: loading || !newPassword || !confirmPassword ? "#93C5FD" : "#2563EB",
                      cursor: loading || !newPassword || !confirmPassword ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Menyimpan..." : "Simpan Password Baru"}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep("otp")}
                    className="text-sm font-medium"
                    style={{ color: "#2563EB" }}
                  >
                    ← Kembali
                  </button>
                </div>
              </>
            )}
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">
            © 2024 SiSurat — Sistem Manajemen Surat Digital
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
  page,
  setPage,
  onLogout,
  collapsed,
  onToggle,
  user,
}: {
  page: Page
  setPage: (p: Page) => void
  onLogout: () => void
  collapsed: boolean
  onToggle: () => void
  user: { name: string; role: string; avatar: string }
}) {
  // Tentukan menu berdasarkan role
  const isKepala = user.role === "Kepala" || user.role === "Kepala Bagian" || user.role?.includes("Kepala")
  
  const nav = [
    { id: "dashboard" as Page, label: "Dashboard", icon: <IconDashboard /> },
    { id: "surat-masuk" as Page, label: "Surat Masuk", icon: <IconInbox /> },
    { id: "surat-keluar" as Page, label: "Surat Keluar", icon: <IconPaperPlane /> },
    ...(isKepala ? [] : [
      { id: "manajemen-akun" as Page, label: "Manajemen Akun", icon: <IconUsers /> },
      { id: "master-data" as Page, label: "Kelola Data", icon: <IconFolder /> },
    ]),
  ]

  const w = collapsed ? "64px" : "240px"

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0 relative"
      style={{
        width: w,
        minWidth: w,
        background: "#0F172A",
        fontFamily: "Inter, sans-serif",
        transition:
          "width 220ms cubic-bezier(0.4,0,0.2,1), min-width 220ms cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        title={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
        className="absolute top-4 right-3 z-10 w-7 h-7 rounded-md flex items-center justify-center transition-colors"
        style={{ color: "#64748B", background: "rgba(255,255,255,0.06)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
        }
      >
        <IconPanelLeft />
      </button>

      {/* Logo */}
      <div
        className="px-4 py-5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#2563EB" }}
          >
            <IconMail />
          </div>
          {!collapsed && (
            <div
              className="overflow-hidden"
              style={{
                opacity: collapsed ? 0 : 1,
                transition: "opacity 150ms",
              }}
            >
              <div className="text-white font-bold text-sm tracking-tight whitespace-nowrap">
                SiSurat
              </div>
              <div className="text-slate-500 text-xs">v2.4.1</div>
            </div>
          )}
        </div>
      </div>

      {/* User */}
      <div
        className="px-4 py-4 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "#2563EB" }}
            title={collapsed ? user.name : undefined}
          >
            {user.avatar}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {user.name}
              </div>
              <div className="text-slate-500 text-xs truncate">
                {user.role}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
        {!collapsed && (
          <div className="text-slate-600 text-xs font-medium px-2 mb-2 uppercase tracking-widest whitespace-nowrap">
            Menu Utama
          </div>
        )}
        {nav.map((item) => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              title={collapsed ? item.label : undefined}
              className="w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all text-left"
              style={{
                padding: collapsed ? "10px" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "rgba(37,99,235,0.15)" : "transparent",
                color: active ? "#60A5FA" : "#94A3B8",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.05)"
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent"
              }}
            >
              <span
                className="flex-shrink-0"
                style={{ color: active ? "#60A5FA" : "#64748B" }}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="flex-1 whitespace-nowrap">{item.label}</span>
              )}
              {!collapsed && (item as any).badge && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: "#EF4444",
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  {(item as any).badge}
                </span>
              )}
              {collapsed && (item as any).badge && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: "#EF4444" }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div
        className="px-2 py-4 border-t flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <button
          onClick={onLogout}
          title={collapsed ? "Keluar" : undefined}
          className="w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all"
          style={{
            padding: collapsed ? "10px" : "10px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "#64748B",
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background =
              "rgba(239,68,68,0.1)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "#FCA5A5"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background =
              "transparent"
            ;(e.currentTarget as HTMLButtonElement).style.color = "#64748B"
          }}
        >
          <span className="flex-shrink-0">
            <IconLogout />
          </span>
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  )
}

// ── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ title, subtitle, onNavigate }: { title: string; subtitle: string; onNavigate?: (page: any, suratId?: string) => void }) {
  const saved = localStorage.getItem("userInfo")
  const avatar = saved ? JSON.parse(saved).avatar : "P"
  const [showDropdown, setShowDropdown] = useState(false)
  const [tindakLanjutList, setTindakLanjutList] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Cek role user
        const savedUser = localStorage.getItem("userInfo")
        const userRole = savedUser ? JSON.parse(savedUser).role?.toLowerCase() : ""
        const isKepala = userRole.includes("kepala")

        if (isKepala) {
          // Kepala: tampilkan surat keluar yang menunggu persetujuan
          const keluarRes = await fetch(`${API_BASE}/api/surat-keluar`)
          const keluarData = await keluarRes.json()
          if (keluarData.success) {
            const menunggu = (keluarData.data || []).filter((s: any) => s.status_approval === "menunggu")
            setTindakLanjutList(menunggu)
          }
        } else {
          // Staff/Admin: tampilkan surat masuk tindak lanjut yang belum selesai
          const [masukRes, reminderRes] = await Promise.all([
            fetch(`${API_BASE}/api/surat-masuk`),
            fetch(`${API_BASE}/api/reminders`),
          ])
          const masuk = await masukRes.json()
          const reminderData = await reminderRes.json()

          const allReminders = reminderData.success ? reminderData.data || [] : []

          if (masuk.success) {
            const tindakLanjut = (masuk.data || []).filter((s: any) => {
              if (s.status_tindak_lanjut !== "iya") return false
              const reminder = allReminders.find((r: any) => {
                const rSmId = typeof r.id_surat_masuk === 'object' ? r.id_surat_masuk?._id : r.id_surat_masuk
                return rSmId === s._id
              })
              return !reminder || reminder.status !== "selesai"
            })
            setTindakLanjutList(tindakLanjut)
          }
          setReminders(allReminders)
        }
      } catch (err) {
        console.error("Error fetching bell data:", err)
      }
    }
    fetchData()
  }, [showDropdown])

  return (
    <>
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 flex-shrink-0 relative">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {(() => {
          const savedUser = localStorage.getItem("userInfo")
          const userRole = savedUser ? JSON.parse(savedUser).role?.toLowerCase() : ""
          const isKepala = userRole.includes("kepala")
          return (
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              title={tindakLanjutList.length > 0 ? `${tindakLanjutList.length} ${isKepala ? 'surat menunggu persetujuan' : 'surat tindak lanjut'}` : "Tidak ada notifikasi"}
            >
              <IconBell />
              {tindakLanjutList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {tindakLanjutList.length}
                </span>
              )}
            </button>
          )
        })()}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "#2563EB" }}
        >
          {avatar}
        </div>
      </div>

      {/* Bell Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            {(() => {
              const savedUser = localStorage.getItem("userInfo")
              const userRole = savedUser ? JSON.parse(savedUser).role?.toLowerCase() : ""
              const isKepala = userRole.includes("kepala")
              return (
                <h3 className="text-sm font-semibold text-slate-900">
                  {isKepala ? "Menunggu Persetujuan" : "Surat Tindak Lanjut"}
                </h3>
              )
            })()}
            <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
          </div>
          {tindakLanjutList.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-slate-400">
              {(() => {
                const savedUser = localStorage.getItem("userInfo")
                const userRole = savedUser ? JSON.parse(savedUser).role?.toLowerCase() : ""
                const isKepala = userRole.includes("kepala")
                return isKepala ? "Tidak ada surat menunggu persetujuan" : "Tidak ada surat tindak lanjut"
              })()}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
              {tindakLanjutList.map((s) => {
                // Cek role untuk tampilkan data berbeda
                const savedUser = localStorage.getItem("userInfo")
                const userRole = savedUser ? JSON.parse(savedUser).role?.toLowerCase() : ""
                const isKepala = userRole.includes("kepala")

                if (isKepala) {
                  // Kepala: tampilkan data surat keluar (tujuan, perihal, status_approval)
                  return (
                    <div
                      key={s._id}
                      className="px-5 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 cursor-pointer"
                      onClick={() => {
                        setShowDropdown(false)
                        onNavigate?.("surat-keluar", s._id)
                      }}
                    >
                      <span className="text-xs mt-0.5">⏳</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{s.tujuan}</p>
                        <p className="text-xs text-slate-500 truncate">{s.perihal}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" style={{ background: "#FEF3C7", color: "#D97706" }}>
                        Menunggu
                      </span>
                    </div>
                  )
                } else {
                  // Staff/Admin: tampilkan data surat masuk (pengirim, perihal, reminder status)
                  const reminder = reminders.find((r: any) => {
                    const rSmId = typeof r.id_surat_masuk === 'object' ? r.id_surat_masuk?._id : r.id_surat_masuk
                    return rSmId === s._id
                  })
                  const isDone = reminder && reminder.status === 'selesai'
                  const isOverdue = reminder && !isDone && new Date(reminder.tanggal_batas) < new Date()
                  const badge = isDone
                    ? { icon: "✅", label: "Selesai", bg: "#ECFDF5", color: "#059669" }
                    : isOverdue
                      ? { icon: "⚠️", label: "Terlewat", bg: "#FEF2F2", color: "#DC2626" }
                      : { icon: "⏳", label: "Menunggu", bg: "#FEF3C7", color: "#D97706" }
                   return (
                    <div
                      key={s._id}
                      className="px-5 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 cursor-pointer"
                      onClick={() => {
                        setShowDropdown(false)
                        onNavigate?.("surat-masuk", s._id)
                      }}
                    >
                      <span className="text-xs mt-0.5">{badge.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{s.pengirim}</p>
                        <p className="text-xs text-slate-500 truncate">{s.perihal}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>
                   )
                }
              })}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}

// ── Rekap Periodik (rekap volume surat per periode) ──────────────────────────
type RekapRow = { periode: string; masuk: number; keluar: number; selesai: number }

const COLS = [
  { key: "masuk", label: "Surat Masuk", color: "#2563EB", bg: "#EFF6FF" },
  { key: "keluar", label: "Surat Keluar", color: "#059669", bg: "#ECFDF5" },
]

function exportToCSV(periode: string, data: RekapRow[]) {
  const header = ["Periode", "Surat Masuk", "Surat Keluar", "Total"]
  const rows = data.map((r) => [
    r.periode,
    r.masuk,
    r.keluar,
    r.masuk + r.keluar,
  ])
  const totalRow = [
    "TOTAL",
    data.reduce((s, r) => s + r.masuk, 0),
    data.reduce((s, r) => s + r.keluar, 0),
    data.reduce((s, r) => s + r.masuk + r.keluar, 0),
  ]
  const csv = [header, ...rows, totalRow].map((r) => r.join(",")).join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Rekap_Surat_${periode.replace(/ /g, "_")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportSuratToCSV(filename: string, data: any[], fields: string[]) {
  const header = fields.join(",")
  const rows = data.map((r) =>
    fields
      .map((f) => {
        let v = r[f]
        if (v instanceof Date || (typeof v === "string" && !isNaN(Date.parse(v)))) {
          v = new Date(v).toLocaleDateString("id-ID")
        }
        return `"${String(v ?? "").replace(/"/g, '""')}"`
      })
      .join(","),
  )
  const csv = [header, ...rows].join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const PERIODE_KEYS = ["Minggu Ini", "Bulan Ini", "Kuartal Ini"] as const
type PeriodeKey = (typeof PERIODE_KEYS)[number]

const WEEK_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

function buildRekap(periode: PeriodeKey, masuk: any[], keluar: any[]): RekapRow[] {
  const rows = new Map<string, { masuk: number; keluar: number; selesai: number }>()
  const bump = (key: string, sec: "masuk" | "keluar" | "selesai") => {
    const r = rows.get(key) || { masuk: 0, keluar: 0, selesai: 0 }
    r[sec] += 1
    rows.set(key, r)
  }

  const now = new Date()
  const weekKey = (d: Date) => {
    const diff = (d.getDay() + 6) % 7
    const monday = new Date(d)
    monday.setDate(d.getDate() - diff)
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`
  }
  const inMonth = (d: Date) =>
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()

  for (const s of masuk) {
    const d = new Date(s.tanggal_terima || s.created_at)
    if (isNaN(d.getTime())) continue
    if (periode === "Minggu Ini") {
      if (weekKey(d) !== weekKey(now)) continue
      bump(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][d.getDay()], "masuk")
      if (s.status_tindak_lanjut === "iya") rows.get(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][d.getDay()])!.selesai += 1
    } else if (periode === "Bulan Ini") {
      if (!inMonth(d)) continue
      bump(`Minggu ${Math.ceil(d.getDate() / 7)}`, "masuk")
      if (s.status_tindak_lanjut === "iya") rows.get(`Minggu ${Math.ceil(d.getDate() / 7)}`)!.selesai += 1
    } else {
      const qStart = Math.floor(now.getMonth() / 3) * 3
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() < qStart || d.getMonth() > qStart + 2) continue
      bump(d.toLocaleDateString("id-ID", { month: "long" }), "masuk")
      if (s.status_tindak_lanjut === "iya") rows.get(d.toLocaleDateString("id-ID", { month: "long" }))!.selesai += 1
    }
  }

  for (const s of keluar) {
    const d = new Date(s.tanggal_kirim || s.created_at)
    if (isNaN(d.getTime())) continue
    if (periode === "Minggu Ini") {
      if (weekKey(d) !== weekKey(now)) continue
      bump(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][d.getDay()], "keluar")
      if (s.status_approval === "disetujui") rows.get(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][d.getDay()])!.selesai += 1
    } else if (periode === "Bulan Ini") {
      if (!inMonth(d)) continue
      bump(`Minggu ${Math.ceil(d.getDate() / 7)}`, "keluar")
      if (s.status_approval === "disetujui") rows.get(`Minggu ${Math.ceil(d.getDate() / 7)}`)!.selesai += 1
    } else {
      const qStart = Math.floor(now.getMonth() / 3) * 3
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() < qStart || d.getMonth() > qStart + 2) continue
      bump(d.toLocaleDateString("id-ID", { month: "long" }), "keluar")
      if (s.status_approval === "disetujui") rows.get(d.toLocaleDateString("id-ID", { month: "long" }))!.selesai += 1
    }
  }

  if (periode === "Minggu Ini") {
    return WEEK_DAYS.map((p) => rows.get(p) || { masuk: 0, keluar: 0, selesai: 0 })
      .map((r, i) => ({ periode: WEEK_DAYS[i], ...r }))
  }
  const sorted = Array.from(rows.entries()).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, "")) || 1
    const numB = parseInt(b[0].replace(/\D/g, "")) || 1
    return numA - numB
  })
  return sorted.map(([periode, r]) => ({ periode, ...r }))
}

function RekapPeriodik() {
  const [periode, setPeriode] = useState<PeriodeKey>("Bulan Ini")
  const [suratMasuk, setSuratMasuk] = useState<any[]>([])
  const [suratKeluar, setSuratKeluar] = useState<any[]>([])

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const [m, k] = await Promise.all([
          fetch(`${API_BASE}/api/surat-masuk`),
          fetch(`${API_BASE}/api/surat-keluar`),
        ])
        const mj = await m.json()
        const kj = await k.json()
        if (mj.success) setSuratMasuk(mj.data || [])
        if (kj.success) setSuratKeluar(kj.data || [])
      } catch (err) {
        console.error("Error fetching rekap:", err)
      }
    }
    fetchAll()
  }, [])

  const data = buildRekap(periode, suratMasuk, suratKeluar)

  const totals = {
    masuk: data.reduce((s, r) => s + r.masuk, 0),
    keluar: data.reduce((s, r) => s + r.keluar, 0),
  }

  return (
    <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm">
            Rekap Periodik
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Volume surat berdasarkan periode
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {PERIODE_KEYS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: periode === p ? "white" : "transparent",
                  color: periode === p ? "#0F172A" : "#64748B",
                  boxShadow:
                    periode === p ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => exportToCSV(periode, data)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Ekspor Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Periode
              </th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {c.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, i) => {
              const total = row.masuk + row.keluar
              return (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">
                    {row.periode}
                  </td>
                  {COLS.map((c) => (
                    <td key={c.key} className="px-6 py-3 text-right">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: c.color,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {row[(c.key as keyof typeof row)]}
                      </span>
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right">
                    <span
                      className="text-sm font-bold text-slate-800"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {total}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr
              style={{ background: "#F8FAFC", borderTop: "2px solid #E2E8F0" }}
            >
              <td className="px-6 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Total
              </td>
              {COLS.map((c) => (
                <td key={c.key} className="px-6 py-3 text-right">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: c.color,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {totals[(c.key as keyof typeof totals)]}
                  </span>
                </td>
              ))}
              <td className="px-6 py-3 text-right">
                <span
                  className="text-sm font-bold text-slate-900"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {totals.masuk + totals.keluar}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Modal Tambah Akun ─────────────────────────────────────────────────────
function ModalTambahAkun({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (user: { id: string; username: string; nama: string }) => void
}) {
  const [username, setUsername] = useState("")
  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roles, setRoles] = useState<Array<{ _id: string; nama_role: string }>>([])
  const [idRole, setIdRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const passwordValidation = usePasswordValidation(password)

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/roles`)
        const data = await response.json()
        if (data.success) {
          setRoles(data.roles || [])
          if (data.roles && data.roles.length > 0) {
            setIdRole(data.roles[0]._id)
          }
        }
      } catch (err) {
        console.error("Error fetching roles:", err)
      }
    }
    fetchRoles()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!username || !nama || !email || !password || !idRole) {
      setError("Semua field wajib diisi termasuk role")
      return
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, nama, email, password, id_role: idRole }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSaved(true)
        onAdd(data.user)
        setTimeout(onClose, 800)
      } else {
        setError(data.error || "Gagal membuat akun")
      }
    } catch (err) {
      setError("Koneksi ke server gagal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Tambah Akun Baru
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@example.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Role
            </label>
            <select
              value={idRole}
              onChange={(e) => setIdRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            >
              {roles.length === 0 && (
                <option value="">Tidak ada role tersedia</option>
              )}
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.nama_role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <PasswordValidationLabel
              message={passwordValidation.message}
              color={passwordValidation.color}
              icon={passwordValidation.icon}
              isEmpty={passwordValidation.isEmpty}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saved || loading}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
              style={{ background: saved || loading ? "#93C5FD" : "#2563EB" }}
            >
              {loading ? "Membuat..." : saved ? "Akun Dibuat ✓" : "Buat Akun"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-all"
              style={{
                color: "#DC2626",
                borderColor: "#FECACA",
                background: "#FFF5F5",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#FEE2E2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FFF5F5")
              }
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Edit User ───────────────────────────────────────────────────────────
function ModalEditUser({
  user,
  onClose,
  onChanged,
}: {
  user: { username: string; nama: string; id_role?: { _id: string; nama_role: string } }
  onClose: () => void
  onChanged: () => void
}) {
  const [newUsername, setNewUsername] = useState(user.username)
  const [newNama, setNewNama] = useState(user.nama)
  const [roles, setRoles] = useState<Array<{ _id: string; nama_role: string }>>([])
  const [idRole, setIdRole] = useState(user.id_role?._id || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/roles`)
        const data = await response.json()
        if (data.success) {
          setRoles(data.roles || [])
          if (!idRole && data.roles && data.roles.length > 0) {
            setIdRole(data.roles[0]._id)
          }
        }
      } catch (err) {
        console.error("Error fetching roles:", err)
      }
    }
    fetchRoles()
  }, [idRole])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!newUsername || !newNama) {
      setError("Username dan Nama wajib diisi")
      return
    }

    if (newUsername === user.username && newNama === user.nama && idRole === user.id_role?._id) {
      setError("Tidak ada perubahan data")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/update-user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: user.username, 
          newUsername: newUsername !== user.username ? newUsername : undefined,
          newNama: newNama !== user.nama ? newNama : undefined,
          id_role: idRole || undefined
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setSaved(true)
        setTimeout(() => {
          onClose()
          onChanged()
        }, 800)
      } else {
        setError(data.error || "Gagal memperbarui data")
        setLoading(false)
      }
    } catch (err) {
      setError("Koneksi ke server gagal")
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Edit Data Pengguna
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {user.nama}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={newNama}
              onChange={(e) => setNewNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Masukkan username baru"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Role
            </label>
            <select
              value={idRole}
              onChange={(e) => setIdRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
            >
              {roles.length === 0 && (
                <option value="">Tidak ada role tersedia</option>
              )}
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.nama_role}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saved || loading}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
              style={{ background: saved || loading ? "#93C5FD" : "#2563EB" }}
            >
              {loading ? "Menyimpan..." : saved ? "Berhasil ✓" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-all"
              style={{
                color: "#DC2626",
                borderColor: "#FECACA",
                background: "#FFF5F5",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#FEE2E2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FFF5F5")
              }
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Ganti Password ──────────────────────────────────────────────────────
function ModalGantiPassword({
  user,
  onClose,
  onChanged,
}: {
  user: { username: string; nama: string }
  onClose: () => void
  onChanged: () => void
}) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const newPasswordValidation = usePasswordValidation(newPassword)
  const confirmPasswordValidation = usePasswordMatch(newPassword, confirmPassword)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!newPassword) {
      setError("Password baru wajib diisi")
      return
    }
    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, newPassword }),
      })
      const data = await response.json()
      if (response.ok) {
        setSaved(true)
        setTimeout(() => {
          onClose()
          onChanged()
        }, 800)
      } else {
        setError(data.error || "Gagal mengganti password")
        setLoading(false)
      }
    } catch (err) {
      setError("Koneksi ke server gagal")
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ganti Password
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Akun: {user.username} — {user.nama}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                style={{ color: "#94A3B8" }}
                title={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                <IconEye open={showPassword} />
              </button>
            </div>
            <PasswordValidationLabel
              message={newPasswordValidation.message}
              color={newPasswordValidation.color}
              icon={newPasswordValidation.icon}
              isEmpty={newPasswordValidation.isEmpty}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Konfirmasi Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <PasswordValidationLabel
              message={confirmPasswordValidation.message}
              color={confirmPasswordValidation.color}
              icon={confirmPasswordValidation.icon}
              isEmpty={confirmPasswordValidation.isEmpty}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saved || loading}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
              style={{ background: saved || loading ? "#93C5FD" : "#2563EB" }}
            >
              {loading ? "Menyimpan..." : saved ? "Berhasil ✓" : "Simpan Password"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-all"
              style={{
                color: "#DC2626",
                borderColor: "#FECACA",
                background: "#FFF5F5",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#FEE2E2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FFF5F5")
              }
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onNavigate }: { onNavigate?: (page: any, suratId?: string) => void }) {
  const [masukCount, setMasukCount] = useState(0)
  const [keluarCount, setKeluarCount] = useState(0)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [masukRes, keluarRes] = await Promise.all([
          fetch(`${API_BASE}/api/surat-masuk`),
          fetch(`${API_BASE}/api/surat-keluar`),
        ])
        const masuk = await masukRes.json()
        const keluar = await keluarRes.json()
        if (masuk.success) {
          const now = new Date()
          const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
          const masukBulanIni = (masuk.data || []).filter((s: any) => inMonth(s.tanggal_terima, thisMonth))
          const keluarBulanIni = (keluar.data || []).filter((s: any) => inMonth(s.tanggal_kirim, thisMonth))
          setMasukCount(masukBulanIni.length)
          setKeluarCount(keluarBulanIni.length)
        }
      } catch (err) {
        console.error("Error fetching stats:", err)
      }
    }
    fetchStats()
  }, [])

  const total = masukCount + keluarCount
  const stats = [
    {
      label: "Surat Masuk",
      value: String(masukCount),
      delta: "Bulan Ini",
      color: "#DC2626",
      bg: "#FEF2F2",
      icon: <IconMailIn />,
    },
    {
      label: "Surat Keluar",
      value: String(keluarCount),
      delta: "Bulan Ini",
      color: "#059669",
      bg: "#ECFDF5",
      icon: <IconMailOut />,
    },
    {
      label: "Total Surat",
      value: String(total),
      delta: "Bulan Ini",
      color: "#2563EB",
      bg: "#EFF6FF",
      icon: <IconMailStack />,
    },
  ]

  // Generate dynamic subtitle
  const getDayName = (date: Date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    return days[date.getDay()]
  }

  const getGreeting = (hour: number) => {
    if (hour < 12) return "Selamat pagi"
    if (hour < 15) return "Selamat siang"
    if (hour < 18) return "Selamat sore"
    return "Selamat malam"
  }

  const now = new Date()
  const dayName = getDayName(now)
  const dateFormatted = now.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const userInfo = localStorage.getItem("userInfo")
  const userName = userInfo ? JSON.parse(userInfo).name : "Pengguna"
  const greeting = getGreeting(now.getHours())
  const subtitle = `${dayName}, ${dateFormatted} — ${greeting}, ${userName}!`

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
    >
      <TopBar
        title="Dashboard"
        subtitle={subtitle}
        onNavigate={onNavigate}
      />

      {/* Bell Dropdown sudah di TopBar */}

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-slate-500 text-sm font-medium">
                  {stat.label}
                </p>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: stat.bg, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className="text-4xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: stat.color }}
                >
                  {stat.delta}
                </span>
              </div>
              <div
                className="h-1 rounded-full"
                style={{ background: stat.bg }}
              />
            </div>
          ))}
        </div>

        {/* Rekap Periodik */}
        <RekapPeriodik />
      </div>
    </div>
  )
}

// ── Folder Panel (reusable) ──────────────────────────────────────────────────
interface FolderItem {
  key: string
  label: string
  count: number
  color: string
}

function FolderPanel({
  title,
  folders,
  selected,
  onSelect,
  month,
  onMonthChange,
  onAddFolder,
  onDeleteWithConfirm,
  totalCount,
}: {
  title: string
  folders: FolderItem[]
  selected: string
  onSelect: (k: string) => void
  month: string
  onMonthChange: (m: string) => void
  onAddFolder?: () => void
  onDeleteWithConfirm?: (key: string) => void
  totalCount?: number
}) {
  const [groupExpanded, setGroupExpanded] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const w = collapsed ? "48px" : "224px"
  const allCount = totalCount ?? folders.reduce((a, f) => a + f.count, 0)

  return (
    <aside
      className="flex-shrink-0 h-full border-r border-slate-200 bg-white flex flex-col relative"
      style={{
        width: w,
        minWidth: w,
        fontFamily: "Inter, sans-serif",
        transition:
          "width 200ms cubic-bezier(0.4,0,0.2,1), min-width 200ms cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-3.5 border-b border-slate-100 flex-shrink-0"
        style={{ minHeight: "52px" }}
      >
        {!collapsed && (
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {title}
          </p>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Perluas panel folder" : "Perkecil panel folder"}
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            color: "#94A3B8",
            background: "transparent",
            marginLeft: collapsed ? "auto" : "0",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <IconPanelRight />
        </button>
      </div>

      {collapsed ? (
        /* Icon-only mode */
        <div className="flex flex-col items-center gap-1 py-3 px-1.5 overflow-y-auto flex-1">
          {/* Semua icon */}
          <button
            onClick={() => onSelect("__all__")}
            title="Semua"
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors relative"
            style={{
              background: selected === "__all__" ? "#EFF6FF" : "transparent",
              color: selected === "__all__" ? "#2563EB" : "#94A3B8",
            }}
            onMouseEnter={(e) => {
              if (selected !== "__all__")
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#F8FAFC"
            }}
            onMouseLeave={(e) => {
              if (selected !== "__all__")
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent"
            }}
          >
            <IconAllMail />
            <span
              className="absolute -top-1 -right-1 text-xs font-bold flex items-center justify-center rounded-full"
              style={{
                background: "#DBEAFE",
                color: "#2563EB",
                fontSize: "9px",
                minWidth: "16px",
                height: "16px",
                padding: "0 3px",
              }}
            >
              {allCount}
            </span>
          </button>
          <div className="w-full h-px my-1" style={{ background: "#F1F5F9" }} />
          {folders.map((f) => (
            <button
              key={f.key}
              onClick={() => onSelect(f.key)}
              title={f.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors relative"
              style={{
                background: selected === f.key ? "#EFF6FF" : "transparent",
                color: selected === f.key ? "#2563EB" : f.color,
              }}
              onMouseEnter={(e) => {
                if (selected !== f.key)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#F8FAFC"
              }}
              onMouseLeave={(e) => {
                if (selected !== f.key)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent"
              }}
            >
              {selected === f.key ? <IconFolderOpen /> : <IconFolder />}
              <span
                className="absolute -top-1 -right-1 text-xs font-bold flex items-center justify-center rounded-full"
                style={{
                  background: "#F1F5F9",
                  color: "#94A3B8",
                  fontSize: "9px",
                  minWidth: "16px",
                  height: "16px",
                  padding: "0 3px",
                }}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      ) : (
        /* Expanded mode */
        <div className="flex-1 overflow-y-auto">
          {/* Filter bulan */}
          <div className="px-3 pt-3">
            <label
              className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5"
            >
              Filter Bulan
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
          {/* Semua */}
          <div className="px-3 pt-3 flex items-center">
            <button
              onClick={() => onSelect("__all__")}
              className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: selected === "__all__" ? "#EFF6FF" : "transparent",
                color: selected === "__all__" ? "#2563EB" : "#475569",
                fontWeight: selected === "__all__" ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (selected !== "__all__")
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#F8FAFC"
              }}
              onMouseLeave={(e) => {
                if (selected !== "__all__")
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent"
              }}
            >
              <span
                style={{
                  color: selected === "__all__" ? "#2563EB" : "#94A3B8",
                }}
              >
                <IconAllMail />
              </span>
              <span className="flex-1 text-left whitespace-nowrap">Semua</span>
            </button>
            <span className="flex items-center justify-end gap-1 flex-shrink-0 w-[60px] pr-1">
              <span
                className="inline-flex items-center justify-center text-xs font-medium px-1 rounded-full flex-shrink-0 leading-none"
                style={{
                  width: "26px",
                  height: "20px",
                  background: selected === "__all__" ? "#DBEAFE" : "#F1F5F9",
                  color: selected === "__all__" ? "#2563EB" : "#64748B",
                }}
              >
                {allCount}
              </span>
            </span>
          </div>

           {/* Folder grup */}
           <div className="px-3 pt-3 pb-4">
             <div className="flex items-center justify-between gap-2 mb-1">
               <button
                 onClick={() => setGroupExpanded((e) => !e)}
                 className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
               >
                 <span
                   style={{
                     display: "inline-block",
                     transform: groupExpanded ? "rotate(90deg)" : "rotate(0deg)",
                     transition: "transform 150ms",
                   }}
                 >
                   <IconChevronRight />
                 </span>
                 Folder
               </button>
               {onAddFolder && (
                 <button
                   onClick={onAddFolder}
                   title="Tambah folder"
                   className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex-shrink-0"
                 >
                   <IconPlus />
                 </button>
               )}
             </div>

            {groupExpanded && (
              <div className="space-y-0.5">
                {folders.map((f) => {
                  return (
                    <div
                      key={f.key}
                      className="group flex items-center rounded-lg"
                      style={{
                        background: selected === f.key ? "#EFF6FF" : "transparent",
                      }}
                    >
                      <button
                        onClick={() => onSelect(f.key)}
                        className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                        style={{
                          background: "transparent",
                          color: selected === f.key ? "#2563EB" : "#475569",
                          fontWeight: selected === f.key ? 600 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (selected !== f.key)
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "#F8FAFC"
                        }}
                        onMouseLeave={(e) => {
                          if (selected !== f.key)
                            (e.currentTarget as HTMLButtonElement).style.background =
                              "transparent"
                        }}
                      >
                        <span
                          style={{
                            color: selected === f.key ? "#2563EB" : f.color,
                          }}
                        >
                          {selected === f.key ? <IconFolderOpen /> : <IconFolder />}
                        </span>
                        <span className="flex-1 text-left truncate">{f.label}</span>
                      </button>
                      <span className="flex items-center justify-end gap-1 flex-shrink-0 w-[60px] pr-1">
                        {onDeleteWithConfirm && (
                          <button
                            onClick={() => onDeleteWithConfirm(f.key)}
                            title="Hapus folder"
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:bg-red-100 hover:text-red-600 transition-all flex-shrink-0"
                          >
                            <IconMinus />
                          </button>
                        )}
                        <span
                          className="inline-flex items-center justify-center text-xs font-medium px-1 rounded-full flex-shrink-0 leading-none"
                          style={{
                            width: "26px",
                            height: "20px",
                            background: selected === f.key ? "#DBEAFE" : "#F1F5F9",
                            color: selected === f.key ? "#2563EB" : "#94A3B8",
                          }}
                        >
                          {f.count}
                        </span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

// ── Modal Tambah Surat ────────────────────────────────────────────────────────
const getCurrentUserId = (): string => {
  const saved = localStorage.getItem("userInfo")
  if (saved) {
    const u = JSON.parse(saved)
    if (u.id) return u.id
  }
  return ""
}

const fileApiUrl = (p: string) => {
   const name = p.split("/").pop() || p
   return `${API_BASE}/api/file-data?nama=${encodeURIComponent(name)}`
}

function ModalEditSurat({
  type,
  surat,
  onClose,
  onSaved,
  folderList,
}: {
  type: "masuk" | "keluar"
  surat: any
  onClose: () => void
  onSaved?: () => void
  folderList?: string[]
}) {
  const [nomorSurat, setNomorSurat] = useState(surat.nomor_surat || "")
  const [perihal, setPerihal] = useState(surat.perihal || "")
  const [isiSurat, setIsiSurat] = useState(surat.isi_surat || "")
  const [kategori, setKategori] = useState(surat.kategori || "biasa")
  const [jenisSurat, setJenisSurat] = useState(surat.jenis_surat || "")
  const [pengirim, setPengirim] = useState(type === "masuk" ? (surat.pengirim || "") : (surat.tujuan || ""))
  const [tanggal, setTanggal] = useState(() => {
    const d = type === "masuk" ? surat.tanggal_terima : surat.tanggal_kirim
    if (!d) return ""
    const date = new Date(d)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  })
  const [folder, setFolder] = useState(surat.folder || "")
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [folders, setFolders] = useState<string[]>([])

  React.useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/custom-folders/${type}`)
        const result = await response.json()
        if (result.success) {
          const names = (result.data || []).map((f: any) => f.nama_folder)
          const allFolders = [...new Set([...names, ...(folderList || [])])]
          setFolders(allFolders.sort())
        }
      } catch (err) {
        console.error("Error fetching folders:", err)
      }
    }
    fetchFolders()
  }, [type, folderList])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!perihal) {
      setError("Perihal wajib diisi")
      return
    }
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("File harus berformat PDF")
        return
      }
      if (file.size > 1.5 * 1024 * 1024) {
        setError("Ukuran file maksimal 1,5 MB")
        return
      }
    }

    setLoading(true)
    try {
      let fileData: any = undefined
      if (file) {
        const fd = new FormData()
        fd.append("file", file)
        const uploadRes = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          body: fd,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          setError(uploadData.error || "Gagal mengunggah file")
          setLoading(false)
          return
        }
        fileData = uploadData.file
      }

      const url = `${API_BASE}/api/surat-${type}/${surat._id}`
      const body: any = {
        nomor_surat: nomorSurat,
        perihal,
        isi_surat: isiSurat,
        kategori,
        jenis_surat: jenisSurat,
        folder: folder || null,
      }
      
      if (type === "masuk") {
        body.pengirim = pengirim
        if (tanggal) body.tanggal_terima = new Date(tanggal).toISOString()
        if (fileData) body.file_lampiran = fileData
      } else {
        body.tujuan = pengirim
        if (tanggal) body.tanggal_kirim = new Date(tanggal).toISOString()
        if (fileData) body.file_draft = fileData
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()

      if (response.ok) {
        setSaved(true)
        setTimeout(() => {
          onClose()
          onSaved?.()
        }, 800)
      } else {
        setError(data.error || "Gagal menyimpan perubahan")
        setLoading(false)
      }
    } catch (err) {
      setError("Koneksi ke server gagal")
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Edit Surat {type === "masuk" ? "Masuk" : "Keluar"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nomor Surat
            </label>
            <input
              type="text"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              placeholder="Contoh: 02.001/SSI-PCT/IX/2026"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              style={{ fontFamily: type === "keluar" ? "JetBrains Mono, monospace" : "inherit" }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Perihal
            </label>
            <input
              type="text"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Perihal surat"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Isi Surat
            </label>
            <textarea
              name="isiSurat"
              value={isiSurat}
              onChange={(e) => {
                console.log("isiSurat changed:", e.target.value)
                setIsiSurat(e.target.value)
              }}
              placeholder="Masukkan isi surat..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white"
            >
              <option value="biasa">Biasa</option>
              <option value="penting">Penting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Jenis Surat
            </label>
            <div className="relative">
              <select
                value={jenisSurat}
                onChange={(e) => setJenisSurat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white"
              >
                {(type === "masuk" ? getJenisSuratMasukOptions() : getJenisSuratKeluarOptions()).map((item) => (
                  <option key={item} value={item}>{item.replace(/^surat\s/, "").replace(/\b\w/g, (c: string) => c.toUpperCase())}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {type === "masuk" ? "Pengirim" : "Tujuan"}
            </label>
            <input
              type="text"
              value={pengirim}
              onChange={(e) => setPengirim(e.target.value)}
              placeholder={type === "masuk" ? "Nama instansi pengirim" : "Nama instansi tujuan"}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {type === "masuk" ? "Tanggal Terima" : "Tanggal Kirim"}
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Pilih Folder (Opsional)
             </label>
             <select
               value={folder}
               onChange={(e) => setFolder(e.target.value)}
               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white appearance-none"
             >
               <option value="">-- Pilih Folder --</option>
               {folders.map((f) => (
                 <option key={f} value={f}>
                   {f}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Unggah File PDF <span className="text-slate-400 font-normal">(maks. 1,5 MB) - Opsional</span>
             </label>
             <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
               <svg
                 width="16"
                 height="16"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="#2563EB"
                 strokeWidth="2"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               >
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                 <polyline points="17 8 12 3 7 8" />
                 <line x1="12" y1="3" x2="12" y2="15" />
               </svg>
               <span className="text-sm text-slate-500 flex-1">
                 {fileName || "Pilih File"}
               </span>
               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                 Browse
               </span>
               <input
                 type="file"
                 accept="application/pdf,.pdf"
                 className="hidden"
                 onChange={(e) => {
                   const f = e.target.files?.[0]
                   setFile(f || null)
                   setFileName(f?.name || "")
                 }}
               />
             </label>
           </div>

           {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saved || loading}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
              style={{ background: saved || loading ? "#93C5FD" : "#2563EB" }}
            >
              {loading ? "Menyimpan..." : saved ? "Tersimpan ✓" : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-all"
              style={{
                color: "#DC2626",
                borderColor: "#FECACA",
                background: "#FFF5F5",
              }}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalTambahSurat({
  type,
  onClose,
  onSaved,
  folderList,
  initialData,
  inline,
  onTindakLanjut,
}: {
  type: "masuk" | "keluar"
  onClose: () => void
  onSaved?: () => void
  folderList?: string[]
  initialData?: {
    tujuan?: string
    perihal?: string
    isiSurat?: string
    kategori?: string
    id_surat_masuk_ref?: string
  }
  inline?: boolean
  onTindakLanjut?: (data: any) => void
}) {
  const [nomorSurat, setNomorSurat] = useState("")
  const todayStr = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }
  const [tanggal, setTanggal] = useState(type === "masuk" ? todayStr() : type === "keluar" ? todayStr() : "")
  const [pihak, setPihak] = useState("")
  const [perihal, setPerihal] = useState("")
  const [isiSurat, setIsiSurat] = useState("")
  const [kategori, setKategori] = useState("biasa")
  const [jenisSurat, setJenisSurat] = useState(type === "keluar" ? "surat tugas" : "")
  const [folder, setFolder] = useState("")
  const [fileName, setFileName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [folders, setFolders] = useState<string[]>([])
  const [nomorManual, setNomorManual] = useState(false)
  const [tindakLanjut, setTindakLanjut] = useState(false)
  const [deadline, setDeadline] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })
  const [idSuratMasukRef, setIdSuratMasukRef] = useState<string | null>(null)

  // Pre-fill data dari surat masuk (tindak lanjut)
  React.useEffect(() => {
    if (initialData) {
      if (initialData.tujuan) setPihak(initialData.tujuan)
      if (initialData.perihal) setPerihal(initialData.perihal)
      if (initialData.isiSurat) setIsiSurat(initialData.isiSurat)
      if (initialData.kategori) setKategori(initialData.kategori)
      if (initialData.id_surat_masuk_ref) setIdSuratMasukRef(initialData.id_surat_masuk_ref)
    }
  }, [initialData])

  // Generate preview nomor surat dengan format: {kodeJenis}.{urutan}/SSI-PCT/{bulanRomawi}/{tahun}
  // Contoh: 04.011/SSI-PCT/V/2026
  const fetchNextNomor = async (jenis: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/surat-keluar/next-nomor/${encodeURIComponent(jenis)}`)
      const data = await res.json()
      if (data.success) setNomorSurat(data.nomor)
    } catch (err) {
      console.error("Error fetching next nomor:", err)
    }
  }

  React.useEffect(() => {
    if (type === "keluar" && !nomorManual) {
      fetchNextNomor(jenisSurat)
    }
  }, [type, jenisSurat, nomorManual])

  React.useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/custom-folders/${type}`)
        const result = await response.json()
        if (result.success) {
          const names = (result.data || []).map((f: any) => f.nama_folder)
          const allFolders = [...new Set([...names, ...(folderList || [])])]
          setFolders(allFolders.sort())
        }
      } catch (err) {
        console.error("Error fetching folders:", err)
      }
    }
    fetchFolders()
  }, [type, folderList])

   const handleSave = async (e: React.FormEvent) => {
     e.preventDefault()
     setError("")
     console.log("=== DEBUG FORM SUBMIT ===")
     console.log("Form values:")
     console.log("  nomorSurat:", nomorSurat)
     console.log("  tanggal:", tanggal)
     console.log("  pihak:", pihak)
     console.log("  perihal:", perihal)
     console.log("  isiSurat:", JSON.stringify(isiSurat))
     console.log("  isiSurat length:", isiSurat.length)
     console.log("  isiSurat isEmpty:", isiSurat === "")
     console.log("  kategori:", kategori)
     console.log("  type:", type)
     console.log("======================")
      
      if (!initialData) {
        // Validasi ketat untuk surat baru
        if (!nomorSurat || !tanggal || !pihak || !perihal) {
          setError("Semua field wajib diisi")
          return
        }
        if (type === "masuk" && !file) {
          setError("File PDF wajib diunggah untuk surat masuk")
          return
        }
      } else {
        // Mode tindak lanjut: minimal perihal saja
        if (!perihal) {
          setError("Perihal wajib diisi")
          return
        }
      }
      if (file) {
       if (!file.name.toLowerCase().endsWith(".pdf")) {
         setError("File harus berformat PDF")
         return
       }
       if (file.size > 1.5 * 1024 * 1024) {
         setError("Ukuran file maksimal 1,5 MB")
         return
       }
     }

     setLoading(true)
     try {
       let fileLampiran: any = undefined
       if (file) {
         const fd = new FormData()
         fd.append("file", file)
         const uploadRes = await fetch(`${API_BASE}/api/upload`, {
           method: "POST",
           body: fd,
         })
         const uploadData = await uploadRes.json()
         if (!uploadRes.ok) {
           setError(uploadData.error || "Gagal mengunggah file")
           setLoading(false)
           return
         }
         fileLampiran = uploadData.file
       }
       const url =
         type === "masuk"
           ? `${API_BASE}/api/surat-masuk`
           : `${API_BASE}/api/surat-keluar`
        const body =
           type === "masuk"
            ? {
                id_user: getCurrentUserId(),
                nomor_surat: nomorSurat,
                pengirim: pihak,
                folder: folder || null,
                perihal,
                isi_surat: isiSurat,
                kategori,
                tanggal_terima: new Date(tanggal).toISOString(),
                file_lampiran: fileLampiran,
                jenis_surat: jenisSurat,
              }
             : {
                 id_user: getCurrentUserId(),
                 nomor_surat: nomorManual ? nomorSurat : undefined,
                 tujuan: pihak,
                 folder: folder || null,
                 perihal,
                 jenis_surat: jenisSurat,
                 isi_surat: isiSurat,
                 kategori,
                 tanggal_kirim: new Date(tanggal).toISOString(),
                 file_draft: fileLampiran,
                 auto_nomor: !nomorManual,
                 id_surat_masuk_ref: idSuratMasukRef || undefined,
               }

        console.log("Sending to server:", { url, body })
        console.log("Body detail - isi_surat:", body.isi_surat)
        console.log("Body keys:", Object.keys(body))
        const response = await fetch(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
       })
       console.log("Response status:", response.status)
       const data = await response.json()
       console.log("Response data:", data)

       if (response.ok) {
         console.log("Surat berhasil disimpan")
         const suratData = data.data

         // Jika tindak lanjut dicentang, tandai, buat reminder & redirect
         if (type === "masuk" && tindakLanjut && suratData?._id) {
           try {
             // 1. Update status_tindak_lanjut ke "iya"
             await fetch(`${API_BASE}/api/surat-masuk/${suratData._id}/status`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ status_tindak_lanjut: "iya" }),
             })

             // 2. Buat reminder dengan deadline
             await fetch(`${API_BASE}/api/reminders`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 id_surat_masuk: suratData._id,
                 tanggal_batas: new Date(deadline).toISOString(),
               }),
             })

             // 3. Redirect ke form surat keluar
             onTindakLanjut?.({
               tujuan: pihak,
               perihal: `Re: ${perihal}`,
               isiSurat: isiSurat,
               kategori: kategori,
               id_surat_masuk_ref: suratData._id,
             })
           } catch (err) {
             console.error("Error preparing tindak lanjut:", err)
           }
         }

         setSaved(true)
         setTimeout(() => {
           onClose()
           onSaved?.()
         }, 800)
       } else {
         console.log("Server error:", data.error)
         setError(data.error || "Gagal menyimpan surat")
         setLoading(false)
       }
     } catch (err) {
       console.error("Fetch error:", err)
        setError("Koneksi ke server gagal: " + (err instanceof Error ? err.message : String(err)))
       setLoading(false)
     }
  }

  return (
    <div
      className={inline ? "flex-1 flex items-center justify-center p-4 overflow-y-auto" : "fixed inset-0 z-50 flex items-center justify-center p-4"}
      style={inline ? { background: "#F8FAFC" } : { background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (!inline && e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[95vh]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Tambah Surat {type === "masuk" ? "Masuk" : "Keluar"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
           {/* Nomor Surat */}
           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Nomor Surat {type === "keluar" && <span className="text-slate-400 font-normal">(otomatis, bisa diubah)</span>}
             </label>
             <div className="space-y-2">
               <input
                 type="text"
                 value={nomorSurat}
                 onChange={(e) => {
                   setNomorSurat(e.target.value)
                   setNomorManual(true)
                 }}
                 placeholder="Contoh: 04.011/SSI-PCT/V/2026"
                 required
                 className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                 style={{ fontFamily: type === "keluar" ? "JetBrains Mono, monospace" : "inherit" }}
               />
               {type === "keluar" && (
                 <div className="flex gap-2 items-start">
                   <button
                     type="button"
                    onClick={() => {
                      setNomorManual(false)
                      fetchNextNomor(jenisSurat)
                    }}
                     className="text-xs text-blue-600 hover:text-blue-800 mt-1 transition-colors px-2 py-1 rounded bg-blue-50 hover:bg-blue-100"
                   >
                     ↻ Reset ke otomatis
                   </button>
                   {!nomorManual && (
                     <div className="text-xs text-slate-500 mt-1 flex-1">
                       <span className="text-green-600">✓ Otomatis</span> - Server akan increment urutan sesuai jenis surat. 
                       Format: <span style={{fontFamily: "monospace"}}>{jenisSurat ? KODE_JENIS_SURAT[jenisSurat] || "??" : "??"}.### /SSI-PCT/{BULAN_ROMAWI[new Date(tanggal).getMonth()]}/{new Date(tanggal).getFullYear()}</span>
                     </div>
                   )}
                   {nomorManual && (
                     <div className="text-xs text-slate-500 mt-1 flex-1">
                       <span className="text-orange-600">✎ Manual</span> - Nomor surat tidak akan diubah oleh sistem
                     </div>
                   )}
                 </div>
               )}
             </div>
           </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {type === "masuk" ? "Tanggal Terima" : "Tanggal Kirim"}
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

            {/* Pengirim / Tujuan */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {type === "masuk" ? "Pengirim" : "Tujuan"}
              </label>
              <input
                type="text"
                value={pihak}
                onChange={(e) => setPihak(e.target.value)}
                placeholder={
                  type === "masuk"
                    ? "Nama instansi pengirim"
                    : "Nama instansi tujuan"
                }
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

           {/* Pilih Folder */}
           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Pilih Folder (Opsional)
             </label>
             <select
               value={folder}
               onChange={(e) => setFolder(e.target.value)}
               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white appearance-none"
             >
               <option value="">-- Pilih Folder --</option>
               {folders.map((f) => (
                 <option key={f} value={f}>
                   {f}
                 </option>
               ))}
             </select>
           </div>

           {/* Perihal */}
           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Perihal
             </label>
             <input
               type="text"
               value={perihal}
               onChange={(e) => setPerihal(e.target.value)}
               placeholder="Perihal surat"
               required
               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
             />
           </div>

           {/* Isi Surat */}
           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Isi Surat
             </label>
             <textarea
               value={isiSurat}
               onChange={(e) => setIsiSurat(e.target.value)}
               placeholder="Masukkan isi surat..."
               rows={4}
               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
             />
           </div>

           {/* Kategori */}
           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Kategori
             </label>
             <div className="relative">
               <select
                 value={kategori}
                 onChange={(e) => setKategori(e.target.value)}
                 className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
               >
                 {getKategoriOptions().map((k) => (
                   <option key={k} value={k}>
                     {k.charAt(0).toUpperCase() + k.slice(1)}
                   </option>
                 ))}
               </select>
               <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                 <svg
                   width="12"
                   height="12"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth="2.5"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 >
                   <polyline points="6 9 12 15 18 9" />
                 </svg>
               </div>
             </div>
           </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Jenis Surat
              </label>
              <div className="relative">
                <select
                  value={jenisSurat}
                  onChange={(e) => setJenisSurat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                >
                  {(type === "masuk" ? JENIS_SURAT_OPTIONS_MASUK : JENIS_SURAT_OPTIONS_KELUAR).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

           {/* Unggah File */}
           <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">
               Unggah File PDF {type === "masuk" && <span style={{ color: "#DC2626" }}>*</span>} <span className="text-slate-400 font-normal">(maks. 1,5 MB) {type === "keluar" && "- Opsional"}</span>
             </label>
             <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
               <svg
                 width="16"
                 height="16"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="#2563EB"
                 strokeWidth="2"
                 strokeLinecap="round"
                 strokeLinejoin="round"
               >
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                 <polyline points="17 8 12 3 7 8" />
                 <line x1="12" y1="3" x2="12" y2="15" />
               </svg>
               <span className="text-sm text-slate-500 flex-1">
                 {fileName || "Pilih File"}
               </span>
               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                 Browse
               </span>
               <input
                 type="file"
                 accept="application/pdf,.pdf"
                 className="hidden"
                 onChange={(e) => {
                   const f = e.target.files?.[0]
                   setFile(f || null)
                   setFileName(f?.name || "")
                 }}
               />
             </label>
           </div>

          {/* Tindak Lanjut + Set Reminder (hanya untuk surat masuk) */}
          {type === "masuk" && (
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={tindakLanjut}
                    onChange={(e) => setTindakLanjut(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                    style={{
                      background: tindakLanjut ? "#2563EB" : "white",
                      borderColor: tindakLanjut ? "#2563EB" : "#CBD5E1",
                    }}
                  >
                    {tindakLanjut && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Tindak Lanjut
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tindakLanjut
                      ? "Atur deadline untuk mengingatkan follow-up surat ini"
                      : "Centang untuk mengatur reminder tindak lanjut"
                    }
                  </p>
                </div>
              </label>
              {tindakLanjut && (
                <div className="ml-7">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Deadline Tindak Lanjut
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-300">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saved || loading}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white text-sm transition-all"
              style={{ background: saved || loading ? "#93C5FD" : "#2563EB" }}
            >
              {loading
                ? "Menyimpan..."
                : saved
                  ? "Tersimpan ✓"
                  : `Tambah Surat ${type === "masuk" ? "Masuk" : "Keluar"}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-all"
              style={{
                color: "#DC2626",
                borderColor: "#FECACA",
                background: "#FFF5F5",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#FEE2E2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#FFF5F5")
              }
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal View Surat (read-only) ────────────────────────────────────────────
function ModalViewSurat({
  type,
  suratId,
  onClose,
}: {
  type: "masuk" | "keluar"
  suratId: string
  onClose: () => void
}) {
  const [surat, setSurat] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    fetch(`${API_BASE}/api/surat-${type}/${suratId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSurat(d.data) })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [type, suratId])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {type === "masuk" ? "Detail Surat Masuk" : "Detail Surat Keluar"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {type === "masuk" ? "Surat asli yang dibalas" : "Surat balasan yang dibuat"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Memuat data surat...</p>
          </div>
        ) : surat ? (
          <div className="px-6 py-5 space-y-4">
            {/* No. Surat & Pengirim/Tujuan */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">No. Surat</p>
                <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {surat.nomor_surat}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{type === "masuk" ? "Pengirim" : "Tujuan"}</p>
                <p className="text-sm font-medium text-slate-800">{type === "masuk" ? surat.pengirim : surat.tujuan}</p>
              </div>
            </div>

            {/* Tanggal & Kategori */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{type === "masuk" ? "Tanggal Terima" : "Tanggal Kirim"}</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatDate(type === "masuk" ? surat.tanggal_terima : surat.tanggal_kirim)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Kategori</p>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                  style={{
                    background: surat.kategori === "penting" ? "#FEF2F2" : "#F1F5F9",
                    color: surat.kategori === "penting" ? "#DC2626" : "#64748B",
                  }}
                >
                  {surat.kategori}
                </span>
              </div>
            </div>

            {/* Jenis & Folder */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Jenis Surat</p>
                <p className="text-sm font-medium text-slate-800 capitalize">{surat.jenis_surat || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Folder</p>
                <p className="text-sm font-medium text-slate-800">{surat.folder || "-"}</p>
              </div>
            </div>

            {/* Perihal */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Perihal</p>
              <p className="text-sm font-medium text-slate-800">{surat.perihal}</p>
            </div>

            {/* Isi Surat */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Isi Surat</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {surat.isi_surat || "-"}
              </p>
            </div>

            {/* File */}
            {type === "masuk" && surat.file_lampiran && (
              <div>
                <p className="text-xs text-slate-400 mb-1">File Dokumen</p>
                <p className="text-sm text-slate-600">{surat.file_lampiran.nama}</p>
              </div>
            )}
            {type === "keluar" && surat.file_draft && (
              <div>
                <p className="text-xs text-slate-400 mb-1">File Draft</p>
                <p className="text-sm text-slate-600">{surat.file_draft.nama}</p>
              </div>
            )}

            {/* Status Tindak Lanjut (untuk surat masuk) */}
            {type === "masuk" && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Status Tindak Lanjut</p>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                  style={{
                    background: surat.status_tindak_lanjut === "iya" ? "#ECFDF5" : "#FEF2F2",
                    color: surat.status_tindak_lanjut === "iya" ? "#059669" : "#DC2626",
                  }}
                >
                  {surat.status_tindak_lanjut === "iya" ? "Sudah Ditindak Lanjut" : "Belum"}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            Surat tidak ditemukan
          </div>
        )}
      </div>
    </div>
  )
}

// ── Modal Preview Surat Keluar (Format Resmi) ───────────────────────────────
function ModalPreviewSurat({
  surat,
  onClose,
}: {
  surat: any
  onClose: () => void
}) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
  }

  const handleCetak = () => {
    const params = new URLSearchParams({
      nomor_surat: surat.nomor_surat || '',
      perihal: surat.perihal || '',
      isi_surat: surat.isi_surat || '',
      tanggal_kirim: surat.tanggal_kirim || '',
      tujuan: surat.tujuan || '',
      file_final_ttd: surat.id_ttd && surat.id_ttd.file_ttd ? JSON.stringify(surat.id_ttd.file_ttd) : '',
    })
    window.open(`format-cetak-pdf.html?${params.toString()}`, '_blank')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-bold text-slate-900">Preview Surat Keluar</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preview Content - Format Resmi */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto" style={{ maxWidth: "210mm", fontFamily: "'Times New Roman', Times, serif", color: "#111" }}>
            {/* Logo + Company */}
            <div className="flex justify-between items-start mb-8">
              <img src={logoSandya} alt="logo" className="h-16" />
              <div className="text-right text-xs leading-relaxed">
                <p className="font-bold text-sm tracking-wide">SANDYA NETWORKS KANTOR LAYANAN PACITAN</p>
                <p>Jl. Jend. Sudirman No. 3, Bowongan, Arjowinangun, Kecamatan Pacitan</p>
                <p>+62 811-8882-2525 | info@sandya.net | www.sandya.net</p>
              </div>
            </div>

            {/* Meta: Nomor & Perihal */}
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-20">Nomor</span>
                  <span className="mr-1">:</span>
                  <span className="font-normal">{surat.nomor_surat || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-20">Perihal</span>
                  <span className="mr-1">:</span>
                  <span className="font-bold underline">{surat.perihal || "-"}</span>
                </div>
              </div>
              <div className="text-sm">
                Pacitan, {formatDate(surat.tanggal_kirim)}
              </div>
            </div>

            {/* Tujuan */}
            <div className="mb-4 text-sm">
              Yth. {surat.tujuan || "-"}
            </div>

            {/* Salam */}
            <div className="mb-4 text-sm">Dengan hormat,</div>

            {/* Isi Surat */}
            <div className="mb-6 text-sm leading-relaxed text-justify">
              <p>{surat.isi_surat || "-"}</p>
            </div>

            {/* Tanda Tangan */}
            {surat.id_ttd && surat.id_ttd.file_ttd && (
              <div className="text-right text-sm mt-8">
                <p className="mb-1">Hormat kami,</p>
                <p className="mb-1">Sandya Networks</p>
                <img
                  src={ttdImage}
                  alt="tanda tangan"
                  className="h-16 ml-auto mb-1"
                />
                <p className="font-bold">Ferry Dwi Leksono</p>
                <p>Kepala Kantor Layanan Pacitan</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleCetak}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#8B5CF6" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            </svg>
            Cetak PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Surat Masuk ──────────────────────────────────────────────────────────────
function SuratMasuk({ onEditClick, onTindakLanjut, refreshTrigger, initialDetailId, onNavigate }: { onEditClick?: (id: string) => void; onTindakLanjut?: (data: any) => void; refreshTrigger?: number; initialDetailId?: string | null; onNavigate?: (page: any, suratId?: string) => void }) {
   const [search, setSearch] = useState("")
   const [selectedFolder, setSelectedFolder] = useState("__all__")
   const [openDetailId, setOpenDetailId] = useState<string | null>(null)
   const [showModal, setShowModal] = useState(false)
   const [data, setData] = useState<any[]>([])
   const [loading, setLoading] = useState(true)
   const [filterKategori, setFilterKategori] = useState("semua")
   const [filterStatus, setFilterStatus] = useState("semua")
   const [month, setMonth] = useState(currentMonthKey)
   const [showAddFolder, setShowAddFolder] = useState(false)
   const [newFolderName, setNewFolderName] = useState("")
   const [customFolders, setCustomFolders] = useState<string[]>([])
   const [viewSurat, setViewSurat] = useState<{ type: "masuk" | "keluar"; id: string } | null>(null)
   const [reminders, setReminders] = useState<any[]>([])
   const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; folder: string }>({
     show: false,
     folder: "",
   })
   const [deleting, setDeleting] = useState(false)
   const [deleteSuratConfirm, setDeleteSuratConfirm] = useState<{
     show: boolean
     id: string
     pihak: string
   }>({ show: false, id: "", pihak: "" })
   const [deletingSurat, setDeletingSurat] = useState(false)
   const [page, setPage] = useState(1)
   const PER_PAGE = 10
   const [previewFile, setPreviewFile] = useState<string | null>(null)

  const openPreview = async (url: string) => {
    try {
      const res = await fetch(url)
      const j = await res.json()
      if (!res.ok || !j.success) return
      const bin = atob(j.data)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const objUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }))
      setPreviewFile(objUrl)
    } catch (err) {
      console.error("Error loading preview:", err)
    }
  }

  const closePreview = () => {
    if (previewFile) URL.revokeObjectURL(previewFile)
    setPreviewFile(null)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/surat-masuk`)
      const result = await response.json()
      if (result.success) {
        setData(result.data || [])
      }
    } catch (err) {
      console.error("Error fetching surat masuk:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomFolders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/custom-folders/masuk`)
      const result = await response.json()
      if (result.success) {
        setCustomFolders(result.data.map((f: any) => f.nama_folder) || [])
      }
    } catch (err) {
      console.error("Error fetching custom folders:", err)
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reminders`)
      const result = await response.json()
      if (result.success) setReminders(result.data || [])
    } catch (err) {
      console.error("Error fetching reminders:", err)
    }
  }

  React.useEffect(() => {
    fetchData()
    fetchCustomFolders()
    fetchReminders()
  }, [refreshTrigger])

  // Auto-open detail jika ada initialDetailId
  React.useEffect(() => {
    if (initialDetailId) {
      setOpenDetailId(initialDetailId)
    }
  }, [initialDetailId])

    const monthData = data.filter((s) => inMonth(s.tanggal_terima, month))
   const folderColors = [
     "#2563EB",
     "#7C3AED",
     "#059669",
     "#D97706",
     "#DC2626",
     "#0891B2",
     "#C026D3",
   ]
   const folders: FolderItem[] = [
     ...customFolders.map((cf, i) => ({
       key: cf,
       label: cf,
       count: monthData.filter((s) => (s.folder || s.pengirim) === cf).length,
       color: folderColors[i % folderColors.length],
     })),
   ].filter((f) => f.count > 0)

   const byFolder =
     selectedFolder === "__all__"
       ? monthData
       : customFolders.includes(selectedFolder)
       ? monthData.filter((s) => (s.folder || s.pengirim) === selectedFolder)
       : monthData
  const filtered = byFolder.filter(
    (s) =>
      (filterKategori === "semua" || s.kategori === filterKategori) &&
      (filterStatus === "semua" ||
        s.status_tindak_lanjut === filterStatus) &&
      (s.perihal.toLowerCase().includes(search.toLowerCase()) ||
        s.pengirim.toLowerCase().includes(search.toLowerCase()) ||
        s.nomor_surat.toLowerCase().includes(search.toLowerCase())),
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  React.useEffect(() => {
    setPage(1)
  }, [search, filterKategori, filterStatus, selectedFolder, month])

  const folderLabel =
    selectedFolder === "__all__" ? "Semua Surat Masuk" : selectedFolder

  const handleAddFolder = async () => {
    if (newFolderName.trim() && !customFolders.includes(newFolderName.trim())) {
      try {
        const response = await fetch(`${API_BASE}/api/custom-folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipe_surat: "masuk",
            nama_folder: newFolderName.trim(),
          }),
        })
        const result = await response.json()
        if (response.ok) {
          const updated = [...customFolders, newFolderName.trim()]
          setCustomFolders(updated)
          setSelectedFolder(newFolderName.trim())
          setNewFolderName("")
          setShowAddFolder(false)
        } else {
          alert(result.error || "Gagal membuat folder")
        }
      } catch (err) {
        console.error("Error adding folder:", err)
        alert("Koneksi ke server gagal")
      }
    }
  }

   const handleConfirmDelete = async () => {
     if (!deleteConfirm.folder) return
     setDeleting(true)
     try {
       const response = await fetch(`${API_BASE}/api/custom-folders/name/${deleteConfirm.folder}`, {
         method: "DELETE",
       })
       if (response.ok) {
         const updated = customFolders.filter((f) => f !== deleteConfirm.folder)
         setCustomFolders(updated)
         if (selectedFolder === deleteConfirm.folder) {
           setSelectedFolder("__all__")
         }
       }
     } catch (err) {
       console.error("Error deleting folder:", err)
     } finally {
       setDeleting(false)
       setDeleteConfirm({ show: false, folder: "" })
     }
   }

   const handleConfirmDeleteSurat = async () => {
     if (!deleteSuratConfirm.id) return
     setDeletingSurat(true)
     try {
       const res = await fetch(`${API_BASE}/api/surat-masuk/${deleteSuratConfirm.id}`, {
         method: "DELETE",
       })
       if (res.ok) {
         setOpenDetailId(null)
         await fetchData()
       }
     } catch (err) {
       console.error("Error deleting surat:", err)
     } finally {
setDeletingSurat(false)
      setDeleteSuratConfirm({ show: false, id: "", pihak: "" })
    }
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
       {showModal && (
         <ModalTambahSurat
           type="masuk"
           onClose={() => setShowModal(false)}
           onSaved={fetchData}
           folderList={customFolders}
           onTindakLanjut={(data) => {
             setShowModal(false)
             onTindakLanjut?.(data)
           }}
         />
        )}
       {showAddFolder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-slate-900">Tambah Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nama folder"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all mb-4"
              onKeyPress={(e) => e.key === "Enter" && handleAddFolder()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddFolder(false)
                  setNewFolderName("")
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: newFolderName.trim() ? "#2563EB" : "#CBD5E1" }}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
       )}
       {deleteConfirm.show && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg shadow-lg p-6 w-96">
             <h3 className="text-lg font-semibold mb-2 text-slate-900">Hapus Folder?</h3>
             <p className="text-sm text-slate-600 mb-6">
               Apakah Anda yakin ingin menghapus folder "<strong>{deleteConfirm.folder}</strong>"? Tindakan ini tidak dapat dibatalkan.
             </p>
             <div className="flex gap-3 justify-end">
               <button
                 onClick={() => setDeleteConfirm({ show: false, folder: "" })}
                 disabled={deleting}
                 className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
               >
                 Batal
               </button>
               <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: deleting ? "#EF4444" : "#DC2626" }}
                >
                  {deleting ? "Menghapus..." : "Hapus Folder"}
                </button>
              </div>
            </div>
          </div>
        )}
        {deleteSuratConfirm.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Hapus Surat?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Apakah Anda yakin ingin menghapus surat dari "<strong>{deleteSuratConfirm.pihak}</strong>"? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteSuratConfirm({ show: false, id: "", pihak: "" })}
                  disabled={deletingSurat}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDeleteSurat}
                  disabled={deletingSurat}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: deletingSurat ? "#EF4444" : "#DC2626" }}
                >
                  {deletingSurat ? "Menghapus..." : "Hapus Surat"}
                </button>
              </div>
            </div>
          </div>
        )}
        {previewFile && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(15,23,42,0.6)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closePreview()
            }}
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ height: "85vh" }}>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Preview PDF</h3>
                <button
                  onClick={closePreview}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <iframe
                src={previewFile}
                title="Preview PDF"
                className="w-full flex-1"
                style={{ border: "none", background: "#F1F5F9" }}
              />
            </div>
          </div>
        )}
        <TopBar
          title="Surat Masuk"
          subtitle={`${data.length} surat terdaftar`}
          onNavigate={onNavigate}
        />
      <div
        className="flex flex-1 overflow-hidden"
        style={{ background: "#F8FAFC" }}
      >
        <FolderPanel
          title="Pengirim"
          folders={folders}
          selected={selectedFolder}
          onSelect={setSelectedFolder}
          month={month}
           onMonthChange={setMonth}
           onAddFolder={() => setShowAddFolder(true)}
           onDeleteWithConfirm={(key) => {
             setOpenDetailId(null)
             setDeleteConfirm({ show: true, folder: key })
           }}
           totalCount={monthData.length}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-slate-200">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span style={{ color: "#2563EB" }}>
                    <IconFolderOpen />
                  </span>
                  {folderLabel}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-40">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconSearch />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari surat masuk..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="biasa">Biasa</option>
                  <option value="penting">Penting</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                >
                  <option value="semua">Semua Status</option>
                  <option value="tidak">Tidak</option>
                  <option value="iya">Iya</option>
                </select>
                <button
                  onClick={() =>
                    exportSuratToCSV("Surat_Masuk", filtered, [
                      "nomor_surat",
                      "pengirim",
                      "perihal",
                      "kategori",
                      "tanggal_terima",
                      "status_tindak_lanjut",
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ background: "#2563EB" }}
                >
                  <IconPlus />
                  <span>Tambah Surat</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr style={{ background: "#F8FAFC" }}>
                       {["NO", "No Surat", "Tanggal", "Pengirim", "Perihal", "Kategori", "Aksi"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                           <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                           Memuat data...
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                          Tidak ada surat masuk
                        </td>
                      </tr>
                   ) : (
                     paged.map((s) => {
                       const isOpen = openDetailId === s._id
                       const tanggalFormatted = new Date(s.tanggal_terima).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
                       return (
                         <React.Fragment key={s._id}>
                           <tr
                             className="transition-colors border-b border-slate-50"
                             style={{ background: isOpen ? "#F0F7FF" : "white" }}
                             onMouseEnter={(e) => {
                               if (!isOpen)
                                 (e.currentTarget as HTMLElement).style.background =
                                   "#F8FAFC"
                             }}
                             onMouseLeave={(e) => {
                               if (!isOpen)
                                 (e.currentTarget as HTMLElement).style.background =
                                   "white"
                             }}
                            >
                              <td className="px-5 py-3.5 text-sm text-slate-600">
                                {(page - 1) * PER_PAGE + paged.indexOf(s) + 1}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                                  {s.nomor_surat}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                                {tanggalFormatted}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-sm font-medium text-slate-800">
                                  {s.pengirim}
                                </span>
                              </td>
                             <td className="px-5 py-3.5">
                               <span className="text-sm text-slate-700 line-clamp-1 max-w-xs">
                                 {s.perihal}
                               </span>
                             </td>
                             <td className="px-5 py-3.5">
                               <div className="flex items-center gap-1.5">
                                 <div
                                   className="w-2 h-2 rounded-full"
                                   style={{
                                     background: s.kategori === "penting" ? "#DC2626" : "#94A3B8",
                                   }}
                                 />
                                 <span className="text-xs text-slate-600 capitalize">
                                   {s.kategori}
                                 </span>
                              </div>
                            </td>
                             <td className="px-5 py-3.5">
                               <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setOpenDetailId(isOpen ? null : s._id)
                                    setDeleteConfirm({ show: false, folder: "" })
                                  }}
                                  title={isOpen ? "Tutup detail" : "Lihat detail"}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{
                                  background: isOpen ? "#2563EB" : "transparent",
                                  color: isOpen ? "white" : "#94A3B8",
                                  border: isOpen ? "none" : "1px solid #E2E8F0",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isOpen) {
                                    ;(e.currentTarget as HTMLElement).style.background =
                                      "#F1F5F9"
                                    ;(e.currentTarget as HTMLElement).style.color =
                                      "#2563EB"
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isOpen) {
                                    ;(e.currentTarget as HTMLElement).style.background =
                                      "transparent"
                                    ;(e.currentTarget as HTMLElement).style.color =
                                      "#94A3B8"
                                  }
                                }}
                               >
                                <IconEye open={isOpen} />
                               </button>
                               <button
                                  onClick={() => {
                                    const fileUrl = s.file_lampiran?.path ? `${window.location.origin}/api/file?nama=${encodeURIComponent(s.file_lampiran.path)}` : ''
                                   const message = `Surat Masuk\n\nNo: ${s.nomor_surat}\nDari: ${s.pengirim}\nPerihal: ${s.perihal}\n\nFile Lampiran:\n${fileUrl}`
                                   window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
                                 }}
                                 title="Kirim via WhatsApp"
                                 className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                 style={{ background: "transparent", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                                 onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = "#F0FDF4"; ;(e.currentTarget as HTMLElement).style.color = "#25D366" }}
                                 onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = "transparent"; ;(e.currentTarget as HTMLElement).style.color = "#94A3B8" }}
                               >
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.666-7.403h-.004a9.87 9.87 0 00-4.869 1.171L2.98 2.757l1.298 4.86a9.861 9.861 0 00-1.512 5.338c0 5.455 4.437 9.884 9.888 9.884 2.64 0 5.122-1.03 6.988-2.898 1.866-1.869 2.965-4.35 2.965-6.986 0-5.447-4.437-9.889-9.888-9.889zm-5.666-3.133c-.162 0-.322-.015-.483-.046-.345-.071-.678-.204-.97-.389a2.084 2.084 0 01-.74-.74c-.185-.292-.318-.625-.389-.97A5.72 5.72 0 014.84 10.5c0-3.14 2.55-5.69 5.69-5.69 1.52 0 2.95.6 4.03 1.67a5.66 5.66 0 011.67 4.03c-.003 3.14-2.553 5.693-5.69 5.69z"/>
                                 </svg>
                               </button>
                                 </div>
                            </td>
                          </tr>
                          {isOpen && (
                            <tr
                              key={s._id + "-detail"}
                              style={{ background: "#F0F7FF" }}
                            >
                              <td colSpan={7} className="px-6 pb-5 pt-0">
                                <div className="rounded-xl border border-blue-100 bg-white shadow-sm overflow-hidden">
                                  <div className="px-5 py-4 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">
                                      Detail Surat Masuk
                                    </p>
                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                      {s.perihal}
                                    </h4>
                                  </div>

                                   <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3 border-b border-slate-50">
                                     <div>
                                       <p className="text-xs text-slate-400 mb-0.5">
                                         No. Surat
                                       </p>
                                       <p
                                         className="text-sm font-semibold text-slate-800"
                                         style={{
                                           fontFamily: "JetBrains Mono, monospace",
                                         }}
                                       >
                                         {s.nomor_surat}
                                       </p>
                                     </div>
                                     <div>
                                       <p className="text-xs text-slate-400 mb-0.5">
                                         Pengirim
                                       </p>
                                       <p className="text-sm font-medium text-slate-800">
                                         {s.pengirim}
                                       </p>
                                     </div>
                                     <div>
                                       <p className="text-xs text-slate-400 mb-0.5">
                                         Tanggal Terima
                                       </p>
                                       <p className="text-sm font-medium text-slate-800">
                                         {tanggalFormatted}
                                       </p>
                                     </div>
                                      <div>
                                        <p className="text-xs text-slate-400 mb-0.5">
                                          Kategori
                                        </p>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ background: s.kategori === "penting" ? "#FEF2F2" : "#F1F5F9", color: s.kategori === "penting" ? "#DC2626" : "#64748B" }}>
                                          {s.kategori}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-400 mb-0.5">
                                          Jenis Surat
                                        </p>
                                        <p className="text-sm font-medium text-slate-800 capitalize">
                                          {s.jenis_surat || "-"}
                                        </p>
                                      </div>
                                      <div>
                                         <p className="text-xs text-slate-400 mb-0.5">
                                           Status Tindak Lanjut
                                         </p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ background: s.status_tindak_lanjut === "iya" ? "#ECFDF5" : "#FEF2F2", color: s.status_tindak_lanjut === "iya" ? "#059669" : "#DC2626" }}>
                                              {s.status_tindak_lanjut === "iya" ? "Sudah Ditindak Lanjut" : "Belum"}
                                            </span>
                                            {(() => {
                                              const reminder = reminders.find((r: any) => {
                                                const smId = typeof r.id_surat_masuk === 'object' ? r.id_surat_masuk?._id : r.id_surat_masuk
                                                return smId === s._id
                                              })
                                              if (reminder) {
                                                const isOverdue = new Date(reminder.tanggal_batas) < new Date() && reminder.status === 'menunggu'
                                                const status = isOverdue ? 'terlewat' : reminder.status
                                                const colors = {
                                                  menunggu: { bg: "#FEF3C7", color: "#D97706", label: "⏳ Menunggu" },
                                                  selesai: { bg: "#ECFDF5", color: "#059669", label: "✅ Selesai" },
                                                  terlewat: { bg: "#FEF2F2", color: "#DC2626", label: "⚠️ Terlewat" },
                                                }
                                                const c = colors[status as keyof typeof colors] || colors.menunggu
                                                return (
                                                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: c.bg, color: c.color }}>
                                                    {c.label}
                                                  </span>
                                                )
                                              }
                                              return null
                                            })()}
                                            {s.status_tindak_lanjut !== "iya" && (
                                             <button
                                               onClick={async () => {
                                                 try {
                                                   const res = await fetch(`${API_BASE}/api/surat-masuk/${s._id}/status`, {
                                                     method: "PATCH",
                                                     headers: { "Content-Type": "application/json" },
                                                     body: JSON.stringify({ status_tindak_lanjut: "iya" }),
                                                   })
                                                   if (res.ok) await fetchData()
                                                 } catch (err) {
                                                   console.error("Error updating status:", err)
                                                 }
                                               }}
                                               className="text-xs font-medium px-2 py-1 rounded text-white transition-colors"
                                               style={{ background: "#059669" }}
                                               title="Tandai sudah ditindak lanjut"
                                             >
                                               Tandai Selesai
                                             </button>
                                           )}
                                            {s.status_tindak_lanjut === "iya" && s.id_surat_keluar_ref && (
                                              <button
                                                onClick={() => setViewSurat({ type: "keluar", id: s.id_surat_keluar_ref?._id || s.id_surat_keluar_ref })}
                                                className="text-xs font-medium px-2 py-1 rounded text-white transition-colors"
                                                style={{ background: "#2563EB" }}
                                                title="Lihat surat keluar terkait"
                                              >
                                                Lihat Surat Keluar →
                                              </button>
                                            )}
                                             {!s.id_surat_keluar_ref && (
                                               <button
                                                 onClick={() => {
                                                   onTindakLanjut?.({
                                                     tujuan: s.pengirim,
                                                     perihal: `Re: ${s.perihal}`,
                                                     isiSurat: s.isi_surat || "",
                                                     kategori: s.kategori || "biasa",
                                                     id_surat_masuk_ref: s._id,
                                                   })
                                                 }}
                                                 className="text-xs font-medium px-2 py-1 rounded text-white transition-colors"
                                                 style={{ background: "#8B5CF6" }}
                                                 title="Buat surat balasan"
                                               >
                                                 Balas?
                                               </button>
                                             )}
                                         </div>
                                       </div>
                                    </div>

                                   <div className="px-5 py-4 border-b border-slate-50">
                                     <p className="text-xs text-slate-400 mb-2">
                                       Perihal
                                     </p>
                                     <p className="text-sm text-slate-700 font-medium">
                                       {s.perihal}
                                     </p>
                                   </div>

                                    <div className="px-5 py-4 border-b border-slate-50">
                                      <p className="text-xs text-slate-400 mb-2">
                                        Isi Surat
                                      </p>
                                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {s.isi_surat || "-"}
                                      </p>
                                    </div>

                                     <div className="px-5 py-4">
                                       <p className="text-xs text-slate-400 mb-3">
                                         File Dokumen
                                       </p>
                                        {s.file_lampiran ? (
                                          <>
                                          <button
                                            onClick={() => {
                                              if (s.file_lampiran.path) {
                                                openPreview(fileApiUrl(s.file_lampiran.path))
                                              }
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                            style={{ background: "#2563EB" }}
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                              <polyline points="14 2 14 8 20 8" />
                                              <line x1="12" y1="19" x2="12" y2="11" />
                                              <line x1="9" y1="14" x2="15" y2="14" />
                                            </svg>
                                            Lihat PDF: {s.file_lampiran.nama}
                                          </button>
                                          </>
                                        ) : (
                                          <p className="text-sm text-slate-500">Tidak ada file dokumen</p>
                                        )}
                                     </div>

<div className="px-5 py-4 border-t border-slate-50 flex flex-wrap gap-1.5">
                                            <button
                                             disabled={false}
                                             onClick={() => onEditClick?.(s._id)}
                                             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                             style={{ background: "#3B82F6" }}
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Edit
                                        </button>
                                           <button
                                             onClick={() =>
                                               setDeleteSuratConfirm({
                                                  show: true,
                                                  id: s._id,
                                                  pihak: s.pengirim,
                                              })
                                            }
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                            style={{ background: "#DC2626" }}
                                         >
                                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                             <polyline points="3 6 5 6 21 6" />
                                             <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                             <line x1="10" y1="11" x2="10" y2="17" />
                                             <line x1="14" y1="11" x2="14" y2="17" />
                                           </svg>
                                            Hapus
                                           </button>
                                         </div>
                                       </div>
                               </td>
                             </tr>
                          )}
                          </React.Fragment>
                       )
                     })
                   )}
                 </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <div
                  className="text-slate-300 mb-3"
                  style={{ fontSize: "2rem" }}
                >
                  📂
                </div>
                <p className="text-slate-400 text-sm">
                  Tidak ada surat di folder ini.
                </p>
              </div>
            )}

            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Menampilkan {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} surat
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: n === page ? "#2563EB" : "#F1F5F9",
                      color: n === page ? "white" : "#64748B",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {viewSurat && (
        <ModalViewSurat
          type={viewSurat.type}
          suratId={viewSurat.id}
          onClose={() => setViewSurat(null)}
        />
      )}
    </div>
  )
}

// ── Surat Keluar (sementara disembunyikan) ────────────────────────────────────
export function SuratKeluar({ onEditClick, initialDetailId }: { onEditClick?: (id: string) => void; initialDetailId?: string | null }) {
    const [search, setSearch] = useState("")
    const [selectedFolder, setSelectedFolder] = useState("__all__")
    const [openDetailId, setOpenDetailId] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterKategori, setFilterKategori] = useState("semua")
    const [month, setMonth] = useState(currentMonthKey)
    const [viewSurat, setViewSurat] = useState<{ type: "masuk" | "keluar"; id: string } | null>(null)
    const [previewSuratId, setPreviewSuratId] = useState<string | null>(null)

    // Auto-open detail jika ada initialDetailId
    React.useEffect(() => {
      if (initialDetailId) {
        setOpenDetailId(initialDetailId)
      }
    }, [initialDetailId])
    const [justApproved, setJustApproved] = useState<string | null>(null)
    const [reminders, setReminders] = useState<any[]>([])
   const [showAddFolder, setShowAddFolder] = useState(false)
   const [newFolderName, setNewFolderName] = useState("")
   const [customFolders, setCustomFolders] = useState<string[]>([])
   const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; folder: string }>({
     show: false,
     folder: "",
   })
   const [deleting, setDeleting] = useState(false)
   const [deleteSuratConfirm, setDeleteSuratConfirm] = useState<{
     show: boolean
     id: string
     pihak: string
   }>({ show: false, id: "", pihak: "" })
   const [deletingSurat, setDeletingSurat] = useState(false)
   const [page, setPage] = useState(1)
   const PER_PAGE = 10
    const [previewFile, setPreviewFile] = useState<string | null>(null)

  const openPreview = async (url: string) => {
    try {
      const res = await fetch(url)
      const j = await res.json()
      if (!res.ok || !j.success) return
      const bin = atob(j.data)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const objUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }))
      setPreviewFile(objUrl)
    } catch (err) {
      console.error("Error loading preview:", err)
    }
  }

  const closePreview = () => {
    if (previewFile) URL.revokeObjectURL(previewFile)
    setPreviewFile(null)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/surat-keluar`)
      const result = await response.json()
      if (result.success) {
        setData(result.data || [])
      }
    } catch (err) {
      console.error("Error fetching surat keluar:", err)
    } finally {
      setLoading(false)
    }
   }

  const fetchCustomFolders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/custom-folders/keluar`)
      const result = await response.json()
      if (result.success) {
        setCustomFolders(result.data.map((f: any) => f.nama_folder) || [])
      }
    } catch (err) {
      console.error("Error fetching custom folders:", err)
    }
  }

  const fetchReminders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reminders`)
      const result = await response.json()
      if (result.success) setReminders(result.data || [])
    } catch (err) {
      console.error("Error fetching reminders:", err)
    }
  }

   React.useEffect(() => {
     fetchData()
     fetchCustomFolders()
     fetchReminders()
   }, [])

    const monthData = data.filter((s) => inMonth(s.tanggal_kirim, month))
   const folderColors = [
     "#059669",
     "#2563EB",
     "#DC2626",
     "#7C3AED",
     "#D97706",
     "#0891B2",
   ]
    const folders: FolderItem[] = [
      ...customFolders.map((cf, i) => ({
        key: cf,
        label: cf,
        count: monthData.filter((s) => (s.folder === cf || (s.folder === null && s.tujuan === cf))).length,
        color: folderColors[i % folderColors.length],
      })),
    ].filter((f) => f.count > 0)

    const byFolder =
      selectedFolder === "__all__"
        ? monthData
        : customFolders.includes(selectedFolder)
        ? monthData.filter((s) => s.folder === selectedFolder || (s.folder === null && s.tujuan === selectedFolder))
        : monthData
   const filtered = byFolder.filter(
     (s) =>
       (filterKategori === "semua" || s.kategori === filterKategori) &&
       (s.perihal.toLowerCase().includes(search.toLowerCase()) ||
         s.tujuan.toLowerCase().includes(search.toLowerCase()) ||
         s.nomor_surat.toLowerCase().includes(search.toLowerCase())),
   )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

   React.useEffect(() => {
     setPage(1)
   }, [search, filterKategori, selectedFolder, month])

   const folderLabel =
     selectedFolder === "__all__" ? "Semua Surat Keluar" : selectedFolder

   const handleAddFolder = async () => {
    if (newFolderName.trim() && !customFolders.includes(newFolderName.trim())) {
      try {
        const response = await fetch(`${API_BASE}/api/custom-folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipe_surat: "keluar",
            nama_folder: newFolderName.trim(),
          }),
        })
        const result = await response.json()
        if (response.ok) {
          const updated = [...customFolders, newFolderName.trim()]
          setCustomFolders(updated)
          setSelectedFolder(newFolderName.trim())
          setNewFolderName("")
          setShowAddFolder(false)
        } else {
          alert(result.error || "Gagal membuat folder")
        }
      } catch (err) {
        console.error("Error adding folder:", err)
        alert("Koneksi ke server gagal")
      }
    }
  }

   const handleConfirmDelete = async () => {
     if (!deleteConfirm.folder) return
     setDeleting(true)
     try {
       const response = await fetch(`${API_BASE}/api/custom-folders/name/${deleteConfirm.folder}`, {
         method: "DELETE",
       })
       if (response.ok) {
         const updated = customFolders.filter((f) => f !== deleteConfirm.folder)
         setCustomFolders(updated)
         if (selectedFolder === deleteConfirm.folder) {
           setSelectedFolder("__all__")
         }
       }
} catch (err) {
        console.error("Error deleting folder:", err)
      } finally {
        setDeleting(false)
        setDeleteConfirm({ show: false, folder: "" })
      }
    }

   const handleConfirmDeleteSurat = async () => {
     if (!deleteSuratConfirm.id) return
     setDeletingSurat(true)
     try {
       const res = await fetch(`${API_BASE}/api/surat-keluar/${deleteSuratConfirm.id}`, {
         method: "DELETE",
       })
       if (res.ok) {
         setOpenDetailId(null)
         await fetchData()
       }
     } catch (err) {
       console.error("Error deleting surat:", err)
     } finally {
       setDeletingSurat(false)
       setDeleteSuratConfirm({ show: false, id: "", pihak: "" })
     }
   }

   return (
     <>
       <div
         className="flex-1 flex flex-col overflow-hidden"
         style={{ fontFamily: "Inter, sans-serif" }}
       >
        {showModal && (
           <ModalTambahSurat
             type="keluar"
             onClose={() => setShowModal(false)}
             onSaved={fetchData}
             folderList={customFolders}
           />
          )}
          {showAddFolder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Tambah Folder</h3>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nama folder"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all mb-4"
                onKeyPress={(e) => e.key === "Enter" && handleAddFolder()}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddFolder(false)
                    setNewFolderName("")
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: newFolderName.trim() ? "#2563EB" : "#CBD5E1" }}
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
         )}
         {deleteConfirm.show && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg shadow-lg p-6 w-96">
               <h3 className="text-lg font-semibold mb-2 text-slate-900">Hapus Folder?</h3>
               <p className="text-sm text-slate-600 mb-6">
                 Apakah Anda yakin ingin menghapus folder "<strong>{deleteConfirm.folder}</strong>"? Tindakan ini tidak dapat dibatalkan.
               </p>
               <div className="flex gap-3 justify-end">
                 <button
                   onClick={() => setDeleteConfirm({ show: false, folder: "" })}
                   disabled={deleting}
                   className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                 >
                   Batal
                 </button>
                 <button
                   onClick={handleConfirmDelete}
                   disabled={deleting}
                   className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                   style={{ background: deleting ? "#EF4444" : "#DC2626" }}
                 >
                   {deleting ? "Menghapus..." : "Hapus Folder"}
                 </button>
               </div>
             </div>
           </div>
         )}
         {deleteSuratConfirm.show && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg shadow-lg p-6 w-96">
               <h3 className="text-lg font-semibold mb-2 text-slate-900">Hapus Surat?</h3>
               <p className="text-sm text-slate-600 mb-6">
Apakah Anda yakin ingin menghapus surat dari "<strong>{deleteSuratConfirm.pihak}</strong>"? Tindakan ini tidak dapat dibatalkan.
               </p>
               <div className="flex gap-3 justify-end">
                 <button
                   onClick={() => setDeleteSuratConfirm({ show: false, id: "", pihak: "" })}
                   disabled={deletingSurat}
                   className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                 >
                   Batal
                 </button>
                 <button
                   onClick={handleConfirmDeleteSurat}
                   disabled={deletingSurat}
                   className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                   style={{ background: deletingSurat ? "#EF4444" : "#DC2626" }}
                 >
                   {deletingSurat ? "Menghapus..." : "Hapus Surat"}
                 </button>
               </div>
             </div>
           </div>
         )}
         {previewFile && (
           <div
             className="fixed inset-0 z-50 flex items-center justify-center p-6"
             style={{ background: "rgba(15,23,42,0.6)" }}
             onClick={(e) => {
               if (e.target === e.currentTarget) closePreview()
             }}
           >
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ height: "85vh" }}>
               <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-sm font-semibold text-slate-900">Preview PDF</h3>
                 <button
                   onClick={closePreview}
                   className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                 >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="18" y1="6" x2="6" y2="18" />
                     <line x1="6" y1="6" x2="18" y2="18" />
                   </svg>
                 </button>
               </div>
               <iframe
                 src={previewFile}
                 title="Preview PDF"
                 className="w-full flex-1"
                 style={{ border: "none", background: "#F1F5F9" }}
               />
             </div>
           </div>
         )}
         <TopBar
           title="Surat Keluar"
           subtitle={`${data.length} surat terdaftar`}
         />
        <div
          className="flex flex-1 overflow-hidden"
          style={{ background: "#F8FAFC" }}
        >
          <FolderPanel
            title="Tujuan"
            folders={folders}
            selected={selectedFolder}
            onSelect={setSelectedFolder}
            month={month}
            onMonthChange={setMonth}
            onAddFolder={() => setShowAddFolder(true)}
            onDeleteWithConfirm={(key) => {
              setOpenDetailId(null)
              setDeleteConfirm({ show: true, folder: key })
            }}
            totalCount={monthData.length}
          />

          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-xl border border-slate-200">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span style={{ color: "#059669" }}>
                    <IconFolderOpen />
                  </span>
                  {folderLabel}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-40">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconSearch />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari surat keluar..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <select
                   value={filterKategori}
                   onChange={(e) => setFilterKategori(e.target.value)}
                   className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                 >
                   <option value="semua">Semua Kategori</option>
                   <option value="biasa">Biasa</option>
                   <option value="penting">Penting</option>
                 </select>
                <button
                  onClick={() =>
                    exportSuratToCSV("Surat_Keluar", filtered, [
                      "nomor_surat",
                      "tujuan",
                      "perihal",
                      "kategori",
                      "tanggal_kirim",
                      "status_approval",
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ background: "#2563EB" }}
                >
                  <IconPlus />
                  <span>Tambah Surat</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["NO", "No Surat", "Tanggal", "Tujuan", "Perihal", "Kategori", "Aksi"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                       <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                         Memuat data...
                       </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                          Tidak ada surat masuk
                        </td>
                    </tr>
                  ) : (
                    paged.map((s) => {
                      const isOpen = openDetailId === s._id
                      const tanggalFormatted = new Date(s.tanggal_kirim).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
                      return (
                        <React.Fragment key={s._id}>
                          <tr
                            className="transition-colors border-b border-slate-50"
                            style={{ background: isOpen ? "#F0FFF8" : "white" }}
                            onMouseEnter={(e) => {
                              if (!isOpen)
                                (e.currentTarget as HTMLElement).style.background =
                                  "#F8FAFC"
                            }}
                            onMouseLeave={(e) => {
                              if (!isOpen)
                                (e.currentTarget as HTMLElement).style.background =
                                  "white"
                            }}
                          >
                            <td className="px-5 py-3.5 text-sm text-slate-600">
                              {(page - 1) * PER_PAGE + paged.indexOf(s) + 1}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                                {s.nomor_surat}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                              {tanggalFormatted}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-medium text-slate-800">
                                {s.tujuan}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-slate-700 line-clamp-1 max-w-xs">
                                {s.perihal}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    background: s.kategori === "penting" ? "#DC2626" : "#94A3B8",
                                  }}
                                />
                                <span className="text-xs text-slate-600 capitalize">
                                  {s.kategori}
                                </span>
                              </div>
                            </td>
                             <td className="px-5 py-3.5">
                               <button
                                 onClick={() => {
                                   setOpenDetailId(isOpen ? null : s._id)
                                   setDeleteConfirm({ show: false, folder: "" })
                                 }}
                                 title={isOpen ? "Tutup detail" : "Lihat detail"}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{
                                  background: isOpen ? "#059669" : "transparent",
                                  color: isOpen ? "white" : "#94A3B8",
                                  border: isOpen ? "none" : "1px solid #E2E8F0",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isOpen) {
                                    ;(e.currentTarget as HTMLElement).style.background =
                                      "#F0FDF4"
                                    ;(e.currentTarget as HTMLElement).style.color =
                                      "#059669"
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isOpen) {
                                    ;(e.currentTarget as HTMLElement).style.background =
                                      "transparent"
                                    ;(e.currentTarget as HTMLElement).style.color =
                                      "#94A3B8"
                                  }
                                }}
                               >
                                <IconEye open={isOpen} />
                                </button>
                                <button
                                  onClick={() => setPreviewSuratId(s._id)}
                                  title="Preview Surat"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                  style={{ background: "transparent", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                                  onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = "#F0FDF4"; ;(e.currentTarget as HTMLElement).style.color = "#8B5CF6" }}
                                  onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = "transparent"; ;(e.currentTarget as HTMLElement).style.color = "#94A3B8" }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                  </svg>
                                </button>
                               <button
                                  onClick={() => {
                                    const params = new URLSearchParams({
                                      nomor_surat: s.nomor_surat || '',
                                      perihal: s.perihal || '',
                                      isi_surat: s.isi_surat || '',
                                      tanggal_kirim: s.tanggal_kirim || '',
                                      tujuan: s.tujuan || '',
                                    })
                                    const printUrl = `${window.location.origin}/format-cetak-pdf.html?${params.toString()}`
                                    const message = `Surat Keluar\n\nNo: ${s.nomor_surat}\nPenerima: ${s.tujuan}\nPerihal: ${s.perihal}\n\nCetak/PDF:\n${printUrl}`
                                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
                                  }}
                                  title="Kirim via WhatsApp"
                                 className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                 style={{ background: "transparent", color: "#94A3B8", border: "1px solid #E2E8F0" }}
                                 onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = "#F0FDF4"; ;(e.currentTarget as HTMLElement).style.color = "#25D366" }}
                                 onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = "transparent"; ;(e.currentTarget as HTMLElement).style.color = "#94A3B8" }}
                               >
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.869 1.171L2.98 2.757l1.298 4.86a9.861 9.861 0 00-1.512 5.338c0 5.455 4.437 9.884 9.888 9.884 2.64 0 5.122-1.03 6.988-2.898 1.866-1.869 2.965-4.35 2.965-6.986 0-5.447-4.437-9.889-9.888-9.889zm-5.666-3.133c-.162 0-.322-.015-.483-.046-.345-.071-.678-.204-.97-.389a2.084 2.084 0 01-.74-.74c-.185-.292-.318-.625-.389-.97A5.72 5.72 0 014.84 10.5c0-3.14 2.55-5.69 5.69-5.69 1.52 0 2.95.6 4.03 1.67a5.66 5.66 0 011.67 4.03c-.003 3.14-2.553 5.693-5.69 5.69z"/>
                                 </svg>
                               </button>
                                  {(() => {
                                    const smId = s.id_surat_masuk_ref?._id || s.id_surat_masuk_ref
                                    const reminder = reminders.find((r: any) => {
                                      const rSmId = typeof r.id_surat_masuk === 'object' ? r.id_surat_masuk?._id : r.id_surat_masuk
                                      return rSmId === smId
                                    })
                                     const isDone = justApproved === s._id || s.id_ttd || (reminder && reminder.status === 'selesai')
                                    // Cek role - hanya Kepala yang bisa tandai selesai
                                    const savedUser = localStorage.getItem("userInfo")
                                    const isKepala = savedUser ? JSON.parse(savedUser).role?.toLowerCase().includes("kepala") : false
                                    if (!isKepala) return null
                                     return (
                                       <button
                                         onClick={async () => {
                                           try {
                                             console.log("Approving surat keluar:", s._id, "perihal:", s.perihal)
                                             // 1. Update reminder → selesai (jika ada)
                                             if (reminder) {
                                               await fetch(`${API_BASE}/api/reminders/${reminder._id}`, {
                                                 method: "PATCH",
                                                 headers: { "Content-Type": "application/json" },
                                                 body: JSON.stringify({ status: "selesai" }),
                                               })
                                             }
                                             // 2. Update surat masuk → tindak_lanjut: "iya" (hanya jika ada ref)
                                             if (smId) {
                                               await fetch(`${API_BASE}/api/surat-masuk/${smId}/status`, {
                                                 method: "PATCH",
                                                 headers: { "Content-Type": "application/json" },
                                                 body: JSON.stringify({ status_tindak_lanjut: "iya" }),
                                               })
                                             }
                                             // 3. Fetch TTD aktif
                                             const ttdRes = await fetch(`${API_BASE}/api/tanda-tangan`)
                                             const ttdData = await ttdRes.json()
                                             const ttd = ttdData.data?.find((t: any) => t.is_aktif)
                                             // 4. Link TTD ke surat keluar via id_ttd
                                             if (ttd) {
                                               const patchRes = await fetch(`${API_BASE}/api/surat-keluar/${s._id}`, {
                                                 method: "PATCH",
                                                 headers: { "Content-Type": "application/json" },
                                                 body: JSON.stringify({
                                                   perihal: s.perihal || "Tidak ada perihal",
                                                   id_ttd: ttd._id,
                                                 }),
                                               })
                                               console.log("PATCH surat-keluar:", patchRes.status)
                                             }
                                             // 5. Langsung update UI
                                             setJustApproved(s._id)
                                             fetchReminders()
                                             fetchData()
                                           } catch (err) {
                                             console.error("Error completing reminder:", err)
                                           }
                                         }}
                                         className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                                         style={{
                                           background: isDone ? "#F1F5F9" : "#ECFDF5",
                                           color: isDone ? "#94A3B8" : "#059669",
                                           border: isDone ? "1px solid #E2E8F0" : "1px solid #A7F3D0",
                                           cursor: isDone ? "default" : "pointer",
                                         }}
                                         title={isDone ? "Sudah disetujui" : "Setujui surat ini"}
                                         disabled={isDone}
                                       >
                                         {isDone ? "✓" : "○"}
                                       </button>
                                     )
                                  })()}
                             </td>
                          </tr>
                          {isOpen && (
                            <tr
                              key={s._id + "-detail"}
                              style={{ background: "#F0FFF8" }}
                            >
                              <td colSpan={7} className="px-6 pb-5 pt-0">
                                <div className="rounded-xl border border-green-100 bg-white shadow-sm overflow-hidden">
                                  <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
                                        Detail Surat Keluar
                                      </p>
                                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                        {s.perihal}
                                      </h4>
                                    </div>
                                  </div>

                                    <div className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3 border-b border-slate-50">
                                       <div>
                                         <p className="text-xs text-slate-400 mb-0.5">
                                           No. Surat
                                         </p>
                                         <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                                           {s.nomor_surat}
                                         </p>
                                       </div>
                                       <div>
                                         <p className="text-xs text-slate-400 mb-0.5">
                                           Tujuan
                                         </p>
                                         <p className="text-sm font-medium text-slate-800">
                                           {s.tujuan}
                                         </p>
                                       </div>
                                       <div>
                                         <p className="text-xs text-slate-400 mb-0.5">
                                           Tanggal Kirim
                                         </p>
                                         <p className="text-sm font-medium text-slate-800">
                                           {tanggalFormatted}
                                         </p>
                                       </div>
                                       <div>
                                         <p className="text-xs text-slate-400 mb-0.5">
                                           Jenis Surat
                                         </p>
                                         <p className="text-sm font-medium text-slate-800 capitalize">
                                           {s.jenis_surat || 'surat tugas'}
                                         </p>
                                       </div>
                                     </div>

                                   <div className="px-5 py-4 border-b border-slate-50">
                                     <p className="text-xs text-slate-400 mb-2">
                                       Perihal
                                     </p>
                                     <p className="text-sm text-slate-700 font-medium">
                                       {s.perihal}
                                     </p>
                                   </div>

                                   <div className="px-5 py-4 border-b border-slate-50">
                                     <p className="text-xs text-slate-400 mb-2">
                                       Isi Surat
                                     </p>
                                     <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                       {s.isi_surat || "-"}
                                     </p>
                                   </div>

                                   <div className="px-5 py-4">
                                     <p className="text-xs text-slate-400 mb-3">
                                       File Dokumen
                                     </p>
                                     <div className="flex flex-wrap gap-2">
{s.file_draft && (
                                          <button
                                            onClick={() => {
                                              if (s.file_draft.path) {
                                                openPreview(fileApiUrl(s.file_draft.path))
                                              }
                                            }}
                                           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                           style={{ background: "#F59E0B" }}
                                         >
                                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                             <polyline points="14 2 14 8 20 8" />
                                             <line x1="12" y1="19" x2="12" y2="11" />
                                             <line x1="9" y1="14" x2="15" y2="14" />
                                           </svg>
                                           Lihat Draft: {s.file_draft.nama}
                                         </button>
                                       )}
                                        {!s.file_draft && (
                                         <p className="text-sm text-slate-500">Tidak ada file dokumen</p>
                                        )}
                                       </div>
                                     </div>

                                    {s.id_surat_masuk_ref && (
                                      <div className="px-5 py-4 border-b border-slate-50">
                                        <p className="text-xs text-slate-400 mb-2">Surat Masuk Terkait</p>
                                        <button
                                          onClick={() => setViewSurat({ type: "masuk", id: s.id_surat_masuk_ref?._id || s.id_surat_masuk_ref })}
                                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                          style={{ background: "#EFF6FF", color: "#2563EB" }}
                                        >
                                          <IconInbox /> Lihat Surat Masuk Asli
                                        </button>
                                      </div>
                                    )}

<div className="px-5 py-4 border-t border-slate-50 flex flex-wrap gap-1.5">
                                        <button
                                          onClick={() => {
                                            const params = new URLSearchParams({
                                              nomor_surat: s.nomor_surat || '',
                                              perihal: s.perihal || '',
                                              isi_surat: s.isi_surat || '',
                                              tanggal_kirim: s.tanggal_kirim || '',
                                              tujuan: s.tujuan || '',
                                              file_final_ttd: s.id_ttd && s.id_ttd.file_ttd ? JSON.stringify(s.id_ttd.file_ttd) : '',
                                            })
                                            window.open(`format-cetak-pdf.html?${params.toString()}`, '_blank')
                                          }}
                                           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                            style={{ background: "#8B5CF6" }}
                                         >
                                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                             <polyline points="6 9 6 2 18 2 18 9" />
                                             <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                           </svg>
                                            Cetak PDF
                                        </button>
                                          <button
                                            disabled={false}
                                            onClick={() => onEditClick?.(s._id)}
                                             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                              style={{ background: "#3B82F6" }}
                                          >
                                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                             <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                             <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                           </svg>
                                            Edit
                                        </button>
                                           <button
                                            onClick={() =>
                                              setDeleteSuratConfirm({
                                                show: true,
                                                id: s._id,
                                                pihak: s.tujuan,
                                             })
                                           }
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                             style={{ background: "#DC2626" }}
                                          >
                                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                             <polyline points="3 6 5 6 21 6" />
                                             <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                             <line x1="10" y1="11" x2="10" y2="17" />
                                             <line x1="14" y1="11" x2="14" y2="17" />
                                           </svg>
                                           Hapus
                                        </button>
                                      </div>
                                 </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <div
                  className="text-slate-300 mb-3"
                  style={{ fontSize: "2rem" }}
                >
                  📂
                </div>
                <p className="text-slate-400 text-sm">
                  Tidak ada surat di folder ini.
                </p>
              </div>
            )}

            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Menampilkan {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} surat
              </span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: n === page ? "#2563EB" : "#F1F5F9",
                      color: n === page ? "white" : "#64748B",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {deleteConfirm.show && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-80">
          <h3 className="text-lg font-semibold mb-2 text-slate-900">Hapus Folder?</h3>
          <p className="text-slate-600 text-sm mb-6">
            Folder <strong>"{deleteConfirm.folder}"</strong> dan semua surat di dalamnya akan dihapus permanen. Yakin?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteConfirm({ show: false, folder: "" })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: deleting ? "#EF4444" : "#DC2626" }}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </div>
    )}
    {deleteConfirm.show && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-80">
          <h3 className="text-lg font-semibold mb-2 text-slate-900">Hapus Folder?</h3>
          <p className="text-slate-600 text-sm mb-6">
            Folder <strong>"{deleteConfirm.folder}"</strong> dan semua surat di dalamnya akan dihapus permanen. Yakin?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteConfirm({ show: false, folder: "" })}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: deleting ? "#EF4444" : "#DC2626" }}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </div>
    )}
    {viewSurat && (
      <ModalViewSurat
        type={viewSurat.type}
        suratId={viewSurat.id}
        onClose={() => setViewSurat(null)}
      />
    )}
    {previewSuratId && (() => {
      const surat = data.find((s: any) => s._id === previewSuratId)
      if (!surat) return null
      return <ModalPreviewSurat surat={surat} onClose={() => setPreviewSuratId(null)} />
    })()}
    </>
  )
}

// ── Tambah Surat Keluar (Full Page - Tindak Lanjut) ──────────────────────────
function TambahSuratKeluarPage({
  initialData,
  onClose,
  onSaved,
  folderList,
}: {
  initialData: any
  onClose: () => void
  onSaved?: () => void
  folderList?: string[]
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
      <ModalTambahSurat
        type="keluar"
        onClose={onClose}
        onSaved={onSaved}
        folderList={folderList}
        initialData={initialData}
        inline
      />
    </div>
  )
}

 // ── Kelola Data ─────────────────────────────────────────────────────────────
function KelolaData() {
  type TabKey = "jenis-masuk" | "jenis-keluar" | "kategori" | "folder"
  const [activeTab, setActiveTab] = useState<TabKey>("jenis-masuk")
  const [jenisMasuk, setJenisMasuk] = useState<string[]>(() => {
    const saved = localStorage.getItem("master_jenis_masuk")
    return saved ? JSON.parse(saved) : ["surat masuk biasa", "surat undangan", "surat pemberitahuan", "surat tugas", "surat perintah", "surat rekomendasi", "surat izin"]
  })
  const [jenisKeluar, setJenisKeluar] = useState<string[]>(() => {
    const saved = localStorage.getItem("master_jenis_keluar")
    return saved ? JSON.parse(saved) : ["surat tugas", "surat pemberitahuan", "surat balasan", "surat undangan", "surat perintah", "surat rekomendasi", "surat izin", "surat edaran", "surat perjanjian/kontrak"]
  })
  const [kategori, setKategori] = useState<string[]>(() => {
    const saved = localStorage.getItem("master_kategori")
    return saved ? JSON.parse(saved) : ["biasa", "penting"]
  })
  const [folderMasuk, setFolderMasuk] = useState<string[]>([])
  const [folderKeluar, setFolderKeluar] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")
  const [newItemKeluar, setNewItemKeluar] = useState("")
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editTab, setEditTab] = useState<"masuk" | "keluar" | null>(null)
  const [editValue, setEditValue] = useState("")

  const isFolderTab = activeTab === "folder"

  React.useEffect(() => {
    if (activeTab === "folder") {
      fetch(`${API_BASE}/api/custom-folders/masuk`).then(r => r.json()).then(d => {
        if (d.success) setFolderMasuk((d.data || []).map((f: any) => f.nama_folder))
      }).catch(() => {})
      fetch(`${API_BASE}/api/custom-folders/keluar`).then(r => r.json()).then(d => {
        if (d.success) setFolderKeluar((d.data || []).map((f: any) => f.nama_folder))
      }).catch(() => {})
    }
  }, [activeTab])

  const items = activeTab === "jenis-masuk" ? jenisMasuk : activeTab === "jenis-keluar" ? jenisKeluar : kategori
  const storageKey = activeTab === "jenis-masuk" ? "master_jenis_masuk" : activeTab === "jenis-keluar" ? "master_jenis_keluar" : activeTab === "kategori" ? "master_kategori" : ""

  const save = (newItems: string[]) => {
    if (activeTab === "jenis-masuk") setJenisMasuk(newItems)
    else if (activeTab === "jenis-keluar") setJenisKeluar(newItems)
    else setKategori(newItems)
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(newItems))
  }

  const handleAddFolder = async (tipe: "masuk" | "keluar") => {
    const nama = tipe === "masuk" ? newItem.trim() : newItemKeluar.trim()
    if (!nama) return
    const list = tipe === "masuk" ? folderMasuk : folderKeluar
    if (list.includes(nama)) return
    try {
      const res = await fetch(`${API_BASE}/api/custom-folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipe_surat: tipe, nama_folder: nama }),
      })
      if (res.ok) {
        if (tipe === "masuk") { setFolderMasuk([...folderMasuk, nama]); setNewItem("") }
        else { setFolderKeluar([...folderKeluar, nama]); setNewItemKeluar("") }
      }
    } catch (err) {
      console.error("Error adding folder:", err)
    }
  }

  const handleFolderDelete = async (tipe: "masuk" | "keluar", idx: number) => {
    const list = tipe === "masuk" ? folderMasuk : folderKeluar
    const nama = list[idx]
    try {
      await fetch(`${API_BASE}/api/custom-folders/name/${encodeURIComponent(nama)}`, { method: "DELETE" })
      if (tipe === "masuk") setFolderMasuk(list.filter((_, i) => i !== idx))
      else setFolderKeluar(list.filter((_, i) => i !== idx))
    } catch (err) {
      console.error("Error deleting folder:", err)
    }
  }

  const handleFolderUpdate = async (tipe: "masuk" | "keluar", idx: number) => {
    if (!editValue.trim()) return
    const list = tipe === "masuk" ? folderMasuk : folderKeluar
    const oldName = list[idx]
    const newName = editValue.trim()
    try {
      await fetch(`${API_BASE}/api/custom-folders/name/${encodeURIComponent(oldName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_folder_baru: newName }),
      })
      const updated = [...list]
      updated[idx] = newName
      if (tipe === "masuk") setFolderMasuk(updated)
      else setFolderKeluar(updated)
    } catch (err) {
      console.error("Error updating folder:", err)
    }
    setEditIdx(null)
    setEditTab(null)
    setEditValue("")
  }

  const handleAdd = async () => {
    if (!newItem.trim()) return
    if (items.includes(newItem.trim())) return
    save([...items, newItem.trim()])
    setNewItem("")
  }

  const handleDelete = async (idx: number) => {
    save(items.filter((_, i) => i !== idx))
  }

  const handleUpdate = async (idx: number) => {
    if (!editValue.trim()) return
    const updated = [...items]
    updated[idx] = editValue.trim()
    save(updated)
    setEditIdx(null)
    setEditTab(null)
    setEditValue("")
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "jenis-masuk", label: "Jenis Surat Masuk" },
    { key: "jenis-keluar", label: "Jenis Surat Keluar" },
    { key: "kategori", label: "Kategori" },
    { key: "folder", label: "Folder" },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#F8FAFC" }}>
      <TopBar title="Kelola Data" subtitle="Kelola pilihan dropdown dan folder di seluruh aplikasi" />
      <div className="flex-1 overflow-y-auto p-8">
        <div className={isFolderTab ? "max-w-5xl" : "max-w-2xl"}>
          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200 mb-6 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setEditIdx(null); setEditValue(""); setNewItem(""); }}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeTab === t.key ? "#2563EB" : "transparent",
                  color: activeTab === t.key ? "white" : "#64748B",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isFolderTab ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Folder Masuk */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Folder Surat Masuk</h3>
                <span className="text-xs text-slate-400">{folderMasuk.length} folder</span>
              </div>
              <div className="px-5 py-3 border-b border-slate-100 flex gap-2">
                <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddFolder("masuk")} placeholder="Nama folder baru..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                <button onClick={() => handleAddFolder("masuk")} disabled={!newItem.trim()} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50" style={{ background: newItem.trim() ? "#2563EB" : "#CBD5E1" }}>Tambah</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-10">No</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama Folder</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {folderMasuk.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-2.5 text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-5 py-2.5">
                        {editIdx === idx && editTab === "masuk" ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFolderUpdate("masuk", idx)} className="w-full px-3 py-1.5 rounded-lg border border-blue-400 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" autoFocus />
                        ) : (
                          <span className="text-sm font-medium text-slate-800">{item}</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        {editIdx === idx && editTab === "masuk" ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleFolderUpdate("masuk", idx)} className="text-xs font-medium text-blue-600 hover:text-blue-800">Simpan</button>
                            <button onClick={() => { setEditIdx(null); setEditTab(null); setEditValue(""); }} className="text-xs font-medium text-slate-400 hover:text-slate-600">Batal</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditIdx(idx); setEditTab("masuk"); setEditValue(item); }} className="text-xs font-medium text-slate-400 hover:text-blue-600">Edit</button>
                            <button onClick={() => handleFolderDelete("masuk", idx)} className="text-xs font-medium text-slate-400 hover:text-red-600">Hapus</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {folderMasuk.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-slate-400">Belum ada folder</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Folder Keluar */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Folder Surat Keluar</h3>
                <span className="text-xs text-slate-400">{folderKeluar.length} folder</span>
              </div>
              <div className="px-5 py-3 border-b border-slate-100 flex gap-2">
                <input type="text" value={newItemKeluar} onChange={(e) => setNewItemKeluar(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddFolder("keluar")} placeholder="Nama folder baru..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                <button onClick={() => handleAddFolder("keluar")} disabled={!newItemKeluar.trim()} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50" style={{ background: newItemKeluar.trim() ? "#2563EB" : "#CBD5E1" }}>Tambah</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-10">No</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama Folder</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {folderKeluar.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-2.5 text-sm text-slate-500">{idx + 1}</td>
                      <td className="px-5 py-2.5">
                        {editIdx === idx && editTab === "keluar" ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFolderUpdate("keluar", idx)} className="w-full px-3 py-1.5 rounded-lg border border-blue-400 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all" autoFocus />
                        ) : (
                          <span className="text-sm font-medium text-slate-800">{item}</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        {editIdx === idx && editTab === "keluar" ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleFolderUpdate("keluar", idx)} className="text-xs font-medium text-blue-600 hover:text-blue-800">Simpan</button>
                            <button onClick={() => { setEditIdx(null); setEditTab(null); setEditValue(""); }} className="text-xs font-medium text-slate-400 hover:text-slate-600">Batal</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditIdx(idx); setEditTab("keluar"); setEditValue(item); }} className="text-xs font-medium text-slate-400 hover:text-blue-600">Edit</button>
                            <button onClick={() => handleFolderDelete("keluar", idx)} className="text-xs font-medium text-slate-400 hover:text-red-600">Hapus</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {folderKeluar.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-sm text-slate-400">Belum ada folder</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {tabs.find((t) => t.key === activeTab)?.label}
              </h3>
              <span className="text-xs text-slate-400">{items.length} item</span>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Tambah item baru..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                onClick={handleAdd}
                disabled={!newItem.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: newItem.trim() ? "#2563EB" : "#CBD5E1" }}
              >
                Tambah
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2.5">
                  {editIdx === idx ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(idx)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-blue-400 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        autoFocus
                      />
                      <button onClick={() => handleUpdate(idx)} className="text-xs font-medium text-blue-600 hover:text-blue-800">Simpan</button>
                      <button onClick={() => { setEditIdx(null); setEditValue(""); }} className="text-xs font-medium text-slate-400 hover:text-slate-600">Batal</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-slate-700 capitalize">{item}</span>
                      <button onClick={() => { setEditIdx(idx); setEditValue(item); }} className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(idx)} className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors">
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">Belum ada data</p>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Manajemen Akun ────────────────────────────────────────────────────────────
function ManajemenAkun() {
  const [showAddUser, setShowAddUser] = useState(false)
  const [changePwUser, setChangePwUser] = useState<{ username: string; nama: string } | null>(null)
  const [editUser, setEditUser] = useState<{ username: string; nama: string; id_role?: { _id: string; nama_role: string } } | null>(null)
  const [users, setUsers] = useState<Array<{ _id: string; username: string; nama: string; id_role?: { _id: string; nama_role: string } }>>([])
  const [loading, setLoading] = useState(true)
  
  // Check user role from localStorage
  const userInfo = localStorage.getItem("userInfo")
  const currentUserRole = userInfo ? JSON.parse(userInfo).role : null
  const isAccessDenied = currentUserRole === "Kepala" || currentUserRole === "Kepala Bagian" || currentUserRole?.includes("Kepala")

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`)
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = (newUser: { id: string; username: string; nama: string }) => {
    setUsers([...users, { _id: newUser.id, username: newUser.username, nama: newUser.nama }])
    setShowAddUser(false)
  }

  const handleDeleteUser = async (username: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/delete-user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUsers(users.filter(u => u.username !== username))
        alert("Akun berhasil dihapus")
      } else {
        alert(data.error || "Gagal menghapus akun")
      }
    } catch (err) {
      alert("Koneksi ke server gagal")
    }
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
    >
      {showAddUser && (
        <ModalTambahAkun
          onClose={() => setShowAddUser(false)}
          onAdd={handleAddUser}
        />
      )}
      {changePwUser && (
        <ModalGantiPassword
          user={changePwUser}
          onClose={() => setChangePwUser(null)}
          onChanged={fetchUsers}
        />
      )}
      {editUser && (
        <ModalEditUser
          user={editUser}
          onClose={() => setEditUser(null)}
          onChanged={fetchUsers}
        />
      )}
      <TopBar
        title="Manajemen Akun"
        subtitle="Kelola akun pengguna sistem SiSurat"
      />

      {isAccessDenied ? (
        <div className="p-8 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "#FEF2F2" }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "#DC2626" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Akses Ditolak
            </h2>
            <p className="text-slate-600 mb-4">
              Anda tidak memiliki izin untuk mengakses halaman Manajemen Akun. Hanya Admin yang dapat mengelola akun pengguna.
            </p>
            <p className="text-slate-500 text-sm">
              Role Anda: <span className="font-semibold">{currentUserRole}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Daftar Akun Pengguna
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {users.length} akun terdaftar
                </p>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ background: "#2563EB" }}
              >
                <IconPlus />
                <span>Tambah Akun</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                        Memuat data...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                        Belum ada akun. Klik "Tambah Akun" untuk membuat akun baru.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 text-sm font-medium text-slate-800">
                          {user.username}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-600">
                          {user.nama}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                            {user.id_role?.nama_role || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() =>
                                setEditUser({ username: user.username, nama: user.nama, id_role: user.id_role })
                              }
                              className="text-sm font-medium px-3 py-1.5 rounded-lg text-white transition-colors hover:opacity-90"
                              style={{ background: "#7C3AED" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                setChangePwUser({ username: user.username, nama: user.nama })
                              }
                              className="text-sm font-medium px-3 py-1.5 rounded-lg text-white transition-colors hover:opacity-90"
                              style={{ background: "#2563EB" }}
                            >
                              Ganti Password
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus akun ${user.username}? Tindakan ini tidak dapat dibatalkan.`)) {
                                  handleDeleteUser(user.username)
                                }
                              }}
                              className="text-sm font-medium px-3 py-1.5 rounded-lg text-white transition-colors hover:opacity-90"
                              style={{ background: "#DC2626" }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Success Page (Temporary) ────────────────────────────────────────────────
// ── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("login")
  const [authed, setAuthed] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userInfo, setUserInfo] = useState<{ id: string | null; name: string; role: string; avatar: string }>({ id: null, name: "Pengguna", role: "-", avatar: "P" })
  const [isLoading, setIsLoading] = useState(true)
  
  // State untuk edit surat
  const [editSuratType, setEditSuratType] = useState<"masuk" | "keluar" | null>(null)
  const [editSuratId, setEditSuratId] = useState<string | null>(null)
  
  // State untuk tindak lanjut
  const [tindakLanjutData, setTindakLanjutData] = useState<any>(null)
  const [suratMasukRefresh, setSuratMasukRefresh] = useState(0)
  const [openSuratId, setOpenSuratId] = useState<string | null>(null)
  
  // Show sidebar on mount
  React.useEffect(() => {
    setSidebarCollapsed(false)
  }, [])

  React.useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthed")
    const savedPage = localStorage.getItem("currentPage")
    
    if (savedAuth === "true") {
      setAuthed(true)
      setPage((savedPage as Page) || "dashboard")
      const savedUser = localStorage.getItem("userInfo")
      if (savedUser) {
        setUserInfo(JSON.parse(savedUser))
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (user?: { id?: string; nama?: string; role?: string | null }) => {
    const info = {
      id: user?.id || null,
      name: user?.nama || "Pengguna",
      role: user?.role || "-",
      avatar: (user?.nama || "P").charAt(0).toUpperCase(),
    }
    setUserInfo(info)
    localStorage.setItem("userInfo", JSON.stringify(info))
    setAuthed(true)
    setPage("dashboard")
    localStorage.setItem("isAuthed", "true")
    localStorage.setItem("currentPage", "dashboard")
  }
  const handleLogout = () => {
    setAuthed(false)
    setPage("login")
    localStorage.removeItem("isAuthed")
    localStorage.removeItem("currentPage")
    localStorage.removeItem("userInfo")
  }

  const handlePageChange = (newPage: Page, suratId?: string) => {
    setPage(newPage)
    if (suratId) {
      setOpenSuratId(suratId)
    } else {
      setOpenSuratId(null)
    }
    if (authed) {
      localStorage.setItem("currentPage", newPage)
    }
  }

  if (isLoading) return null

  if (!authed && page === "lupa-password")
    return <LupaPasswordPage onBack={() => setPage("login")} />
  if (!authed)
    return (
      <LoginPage
        onLogin={handleLogin}
        onLupaPassword={() => setPage("lupa-password")}
      />
    )

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Sidebar
        page={page}
        setPage={handlePageChange}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        user={userInfo}
      />
      
      {/* Jika sedang edit surat, tampilkan halaman edit */}
      {page === "edit-surat" && editSuratType && editSuratId ? (
        <EditSuratPage
          type={editSuratType}
          suratId={editSuratId}
          onClose={() => {
            setEditSuratType(null)
            setEditSuratId(null)
            setPage(editSuratType === "masuk" ? "surat-masuk" : "surat-keluar")
          }}
          onSaved={() => {
            setEditSuratType(null)
            setEditSuratId(null)
            setPage(editSuratType === "masuk" ? "surat-masuk" : "surat-keluar")
          }}
        />
      ) : page === "tambah-surat-keluar" ? (
        <TambahSuratKeluarPage
          initialData={tindakLanjutData}
          onClose={() => {
            setTindakLanjutData(null)
            setPage("surat-masuk")
            setSuratMasukRefresh(prev => prev + 1)
          }}
          onSaved={() => {
            setTindakLanjutData(null)
            setPage("surat-masuk")
            setSuratMasukRefresh(prev => prev + 1)
          }}
          folderList={[]}
        />
      ) : (
        <>
          {page === "dashboard" && <Dashboard onNavigate={handlePageChange} />}
          {page === "surat-masuk" && <SuratMasuk
            onEditClick={(id) => { setEditSuratType("masuk"); setEditSuratId(id); setPage("edit-surat"); }}
            onTindakLanjut={(data) => { setTindakLanjutData(data); setPage("tambah-surat-keluar"); }}
            refreshTrigger={suratMasukRefresh}
            initialDetailId={openSuratId}
            onNavigate={handlePageChange}
          />}
          {page === "surat-keluar" && <SuratKeluar onEditClick={(id) => { setEditSuratType("keluar"); setEditSuratId(id); setPage("edit-surat"); }} initialDetailId={openSuratId} />}
          {page === "manajemen-akun" && <ManajemenAkun />}
          {page === "master-data" && <KelolaData />}
        </>
      )}
    </div>
  )
}
