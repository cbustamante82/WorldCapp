// LoginView — Inicio de sesión via Supabase Auth.

import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function LoginView({ onGoRegister, onGoRecover }) {
  const { login }  = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (err) {
      if (err?.message?.toLowerCase().includes('email not confirmed')) {
        setError('Debés confirmar tu cuenta. Revisá tu correo electrónico y hacé clic en el enlace de confirmación.')
      } else {
        setError('Email o contraseña incorrectos.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Iniciar sesión">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Contraseña" type="password" value={password} onChange={setPassword} autoComplete="current-password" />

        {error && <p className="rounded-lg bg-accent-red/10 p-2.5 text-center text-sm text-accent-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-pitch py-3 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Verificando…' : 'Ingresar'}
        </button>

        <div className="flex justify-between text-xs text-ink-soft">
          <button type="button" onClick={onGoRecover} className="hover:text-ink hover:underline">
            Olvidé mi contraseña
          </button>
          <button type="button" onClick={onGoRegister} className="hover:text-ink hover:underline">
            Crear cuenta
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

function Field({ label, type, value, onChange, autoComplete }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-ink">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full rounded-lg border border-paper-deep bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pitch/50"
      />
    </div>
  )
}

export function AuthShell({ title, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pitch text-white brand-title text-3xl shadow-lg">
            26
          </span>
          <p className="brand-title text-2xl text-ink">WorldCapp</p>
          <p className="text-xs uppercase tracking-widest text-ink-soft">Álbum Mundial 2026</p>
        </div>
        <div className="rounded-2xl border border-paper-deep bg-paper p-6 shadow-xl">
          <h1 className="mb-5 brand-title text-2xl text-ink">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
