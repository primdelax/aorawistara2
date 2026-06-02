// src/app/components/admin/AdminLogin.tsx
import { useState } from 'react'
import { authApi } from '../../lib/api'
import { Logo } from '../Logo'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export function AdminLogin({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[A-Za-z0-9]+$/.test(username)) { setError('Username hanya boleh berisi huruf dan angka tanpa spasi.'); return }
    if (!password) { setError('Password wajib diisi.'); return }
    setError('')
    setLoading(true)
    try {
      await authApi.login(username.toLowerCase(), password)
      onLogin()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal. Periksa username dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1F44] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="admin-login-card bg-white rounded-3xl p-10 border-2 border-[#E63946]">
          <div className="flex justify-center mb-8">
            <Logo className="h-12" />
          </div>
          <h1 className="text-[#0A1F44] text-center mb-1" style={{ fontWeight: 900, fontSize: 26, letterSpacing: '-0.03em' }}>
            Admin Panel
          </h1>
          <p className="text-[#0A1F44]/50 text-center text-sm mb-8">Masuk untuk mengelola website Aora</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#0A1F44] text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Username</label>
              <input
                type="text" value={username}
                onChange={e => setUsername(e.target.value.replace(/[^A-Za-z0-9]/g, '').toLowerCase())}
                required autoFocus
                pattern="[A-Za-z0-9]+"
                minLength={3}
                maxLength={32}
                className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-[#0A1F44]"
                placeholder=""
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-[#0A1F44] text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#F7F7F9] px-4 py-3 pr-11 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-[#0A1F44]"
                  placeholder=""
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A1F44]/40 hover:text-[#0A1F44]">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#E63946] hover:bg-[#c42d3a] disabled:opacity-60 text-white py-4 rounded-xl mt-2 transition-colors"
              style={{ fontWeight: 800, fontSize: 15 }}
            >
              {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
            </button>
            <button
              type="button" onClick={onBack}
              className="w-full border border-[#0A1F44]/15 hover:bg-[#0A1F44]/5 text-[#0A1F44] py-3.5 rounded-xl mt-3 transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 700, fontSize: 14 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
          </form>
        </div>
        <p className="text-center text-white/30 text-xs mt-6">Aora © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
