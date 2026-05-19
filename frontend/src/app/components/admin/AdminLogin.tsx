// src/app/components/admin/AdminLogin.tsx
import { useState } from 'react'
import { authApi } from '../../lib/api'
import { Logo } from '../Logo'
import { Eye, EyeOff } from 'lucide-react'

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@aorawistara.id')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Password wajib diisi.'); return }
    setError('')
    setLoading(true)
    try {
      await authApi.login(email, password)
      onLogin()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal. Periksa email dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1F44] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-black/30">
          <div className="flex justify-center mb-8">
            <div className="bg-[#0A1F44] px-5 py-3 rounded-2xl">
              <Logo />
            </div>
          </div>
          <h1 className="text-[#0A1F44] text-center mb-1" style={{ fontWeight: 900, fontSize: 26, letterSpacing: '-0.03em' }}>
            Admin Panel
          </h1>
          <p className="text-[#0A1F44]/50 text-center text-sm mb-8">Masuk untuk mengelola website AORA Wistara</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#0A1F44] text-xs uppercase tracking-widest block mb-2" style={{ fontWeight: 800 }}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required autoFocus
                className="w-full bg-[#F7F7F9] px-4 py-3 rounded-xl outline-none focus:ring-2 ring-[#E63946]/40 text-[#0A1F44]"
                placeholder="admin@aorawistara.id"
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
                  placeholder="••••••••"
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
          </form>
        </div>
        <p className="text-center text-white/30 text-xs mt-6">AORA Wistara © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
