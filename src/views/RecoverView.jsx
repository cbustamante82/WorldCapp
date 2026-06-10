// RecoverView — Recuperación de contraseña por pregunta secreta + email de Supabase.
// Paso 1: ingresa email → se muestra la pregunta secreta.
// Paso 2: responde correctamente → Supabase envía email con enlace de recuperación.
// Paso 3: usuario hace click en el email → NewPasswordView establece la nueva contraseña.

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { hashSecretAnswer } from '../auth/authUtils'
import { AuthShell } from './LoginView'

export default function RecoverView({ onGoLogin }) {
  const [step,    setStep]    = useState('email')   // 'email' | 'question' | 'sent'
  const [email,   setEmail]   = useState('')
  const [pregunta, setPregunta] = useState('')
  const [answer,  setAnswer]  = useState('')
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  // Paso 1: busca la pregunta secreta del usuario
  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_pregunta_secreta', {
        p_email: email.trim().toLowerCase(),
      })
      if (error || !data) {
        setError('No existe una cuenta con ese email.')
        return
      }
      setPregunta(data)
      setStep('question')
    } finally {
      setLoading(false)
    }
  }

  // Paso 2: verifica la respuesta y envía el email de recuperación
  async function handleAnswerSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!answer.trim()) { setError('Ingresa tu respuesta.'); return }

    setLoading(true)
    try {
      const answerHash = await hashSecretAnswer(answer)
      const { data: ok } = await supabase.rpc('verify_secret_answer', {
        p_email:       email.trim().toLowerCase(),
        p_answer_hash: answerHash,
      })

      if (!ok) { setError('Respuesta incorrecta. Intenta nuevamente.'); return }

      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      })
      setStep('sent')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'sent') {
    return (
      <AuthShell title="Revisa tu correo">
        <div className="space-y-4 text-center">
          <span className="text-5xl">📧</span>
          <p className="text-sm text-ink">
            Respuesta correcta. Te enviamos un enlace para establecer tu nueva contraseña.
          </p>
          <button onClick={onGoLogin}
            className="w-full rounded-xl bg-pitch py-3 text-sm font-bold text-white">
            Volver al inicio de sesión
          </button>
        </div>
      </AuthShell>
    )
  }

  if (step === 'question') {
    return (
      <AuthShell title="Verificar identidad">
        <form onSubmit={handleAnswerSubmit} className="space-y-4" noValidate>
          <div className="rounded-lg bg-paper-deep p-3 text-sm text-ink">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Pregunta secreta
            </p>
            <p>{pregunta}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink">Tu respuesta</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoComplete="off"
              required
              className="w-full rounded-lg border border-paper-deep bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pitch/50"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-accent-red/10 p-2.5 text-center text-sm text-accent-red">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-pitch py-3 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50">
            {loading ? 'Verificando…' : 'Verificar respuesta'}
          </button>

          <button type="button" onClick={onGoLogin}
            className="w-full text-center text-xs text-ink-soft hover:underline">
            ← Volver al inicio de sesión
          </button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Recuperar contraseña">
      <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-ink-soft">
          Ingresa tu email y te mostraremos tu pregunta secreta.
        </p>
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-paper-deep bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pitch/50"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-accent-red/10 p-2.5 text-center text-sm text-accent-red">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-pitch py-3 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50">
          {loading ? 'Buscando…' : 'Continuar'}
        </button>

        <button type="button" onClick={onGoLogin}
          className="w-full text-center text-xs text-ink-soft hover:underline">
          ← Volver al inicio de sesión
        </button>
      </form>
    </AuthShell>
  )
}
