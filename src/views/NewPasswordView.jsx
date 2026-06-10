// NewPasswordView — Establece nueva contraseña tras el enlace de recuperación.
// Supabase dispara PASSWORD_RECOVERY en onAuthStateChange; App.jsx muestra esta vista.

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { validatePassword } from '../auth/authUtils'
import { AuthShell } from './LoginView'

export default function NewPasswordView() {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const pwdErr = validatePassword(password)
    if (pwdErr)              { setError(pwdErr); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setError(error.message); return }
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Contraseña actualizada">
        <div className="space-y-4 text-center">
          <span className="text-5xl">✅</span>
          <p className="text-sm text-ink">Tu contraseña fue actualizada correctamente.</p>
          <p className="text-xs text-ink-soft">Serás redirigido al álbum automáticamente.</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Nueva contraseña">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-ink-soft">Elige una nueva contraseña para tu cuenta.</p>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">Nueva contraseña</label>
          <p className="mb-1 text-[11px] text-ink-soft/70">8-16 chars · mayúscula · número · carácter especial</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-lg border border-paper-deep bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pitch/50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">Confirmar contraseña</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded-lg border border-paper-deep bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pitch/50"
          />
        </div>

        {error && <p className="rounded-lg bg-accent-red/10 p-2.5 text-center text-sm text-accent-red">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-pitch py-3 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50">
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </AuthShell>
  )
}
