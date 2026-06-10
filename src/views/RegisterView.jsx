// RegisterView — Registro de nuevo usuario via Supabase Auth.

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { validatePassword, hashSecretAnswer, SECRET_QUESTIONS, COUNTRIES } from '../auth/authUtils'
import { SELECCIONES } from '../data/selecciones'
import { AuthShell }  from './LoginView'
import FlagSelect     from '../components/FlagSelect'

const COUNTRY_ISO = {
  'Argentina':'ar','Bolivia':'bo','Brasil':'br','Chile':'cl','Colombia':'co',
  'Costa Rica':'cr','Cuba':'cu','Ecuador':'ec','El Salvador':'sv','España':'es',
  'Guatemala':'gt','Honduras':'hn','México':'mx','Nicaragua':'ni','Panamá':'pa',
  'Paraguay':'py','Perú':'pe','Puerto Rico':'pr','República Dominicana':'do',
  'Uruguay':'uy','Venezuela':'ve','Estados Unidos':'us','Canadá':'ca',
  'Francia':'fr','Alemania':'de','Italia':'it','Portugal':'pt','Reino Unido':'gb',
  'Australia':'au','Japón':'jp','Marruecos':'ma',
}

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c, label: c, iso2: COUNTRY_ISO[c] ?? null }))
const TEAM_OPTIONS    = SELECCIONES.map((s) => ({ value: s.id, label: s.name, iso2: s.iso2 }))

export default function RegisterView({ onGoLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', country: '', favoriteTeam: '',
    preguntaSecreta: SECRET_QUESTIONS[0], respuestaSecreta: '',
    password: '', confirm: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  function set(field) { return (e) => setForm((f) => ({ ...f, [field]: e.target.value })) }

  function validate() {
    const e = {}
    if (!form.name.trim())     e.name     = 'Requerido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.country)         e.country  = 'Requerido'
    if (!form.favoriteTeam)             e.favoriteTeam     = 'Requerido'
    if (!form.respuestaSecreta.trim())  e.respuestaSecreta = 'Requerido'
    const pwdErr = validatePassword(form.password)
    if (pwdErr)                e.password = pwdErr
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      const respuestaHash = await hashSecretAnswer(form.respuestaSecreta)
      const { error } = await supabase.auth.signUp({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        options:  {
          data: {
            name:            form.name.trim(),
            country:         form.country,
            favoriteTeam:    form.favoriteTeam,
            preguntaSecreta: form.preguntaSecreta,
            respuestaHash,
          },
        },
      })
      if (error) { setErrors({ general: error.message }); return }
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="¡Cuenta creada!">
        <div className="space-y-4 text-center">
          <span className="text-5xl">✅</span>
          <p className="text-sm text-ink">
            Revisa tu correo y confirma tu cuenta para poder iniciar sesión.
          </p>
          <button onClick={onGoLogin}
            className="w-full rounded-xl bg-pitch py-3 text-sm font-bold text-white">
            Ir al inicio de sesión
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Crear cuenta">
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <RF label="Nombre completo" error={errors.name}>
          <input type="text" value={form.name} onChange={set('name')} autoComplete="name"
            className={inputCls(errors.name)} />
        </RF>

        <RF label="Email (será tu usuario)" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email"
            className={inputCls(errors.email)} />
        </RF>

        <RF label="País" error={errors.country}>
          <FlagSelect
            options={COUNTRY_OPTIONS}
            value={form.country}
            onChange={(v) => setForm((f) => ({ ...f, country: v }))}
            placeholder="Seleccione país…"
            error={!!errors.country}
          />
        </RF>

        <RF label="Selección de la que soy fan" error={errors.favoriteTeam}>
          <FlagSelect
            options={TEAM_OPTIONS}
            value={form.favoriteTeam}
            onChange={(v) => setForm((f) => ({ ...f, favoriteTeam: v }))}
            placeholder="Seleccione selección…"
            error={!!errors.favoriteTeam}
          />
        </RF>

        <RF label="Pregunta secreta">
          <select value={form.preguntaSecreta} onChange={set('preguntaSecreta')} className={inputCls()}>
            {SECRET_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </RF>

        <RF label="Respuesta secreta" error={errors.respuestaSecreta}>
          <input type="text" value={form.respuestaSecreta} onChange={set('respuestaSecreta')}
            autoComplete="off" className={inputCls(errors.respuestaSecreta)} />
        </RF>

        <RF label="Contraseña" error={errors.password}
          hint="8-16 chars · mayúscula · número · carácter especial">
          <input type="password" value={form.password} onChange={set('password')}
            autoComplete="new-password" className={inputCls(errors.password)} />
        </RF>

        <RF label="Confirmar contraseña" error={errors.confirm}>
          <input type="password" value={form.confirm} onChange={set('confirm')}
            autoComplete="new-password" className={inputCls(errors.confirm)} />
        </RF>

        {errors.general && (
          <p className="rounded-lg bg-accent-red/10 p-2.5 text-center text-sm text-accent-red">
            {errors.general}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-pitch py-3 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50">
          {loading ? 'Creando cuenta…' : 'Registrarse'}
        </button>

        <p className="text-center text-xs text-ink-soft">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onGoLogin} className="font-semibold text-pitch hover:underline">
            Iniciar sesión
          </button>
        </p>
      </form>
    </AuthShell>
  )
}

function RF({ label, hint, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-ink">{label}</label>
      {hint && <p className="mb-1 text-[11px] text-ink-soft">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
    </div>
  )
}

function inputCls(err) {
  return [
    'w-full rounded-lg border px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2',
    err
      ? 'border-accent-red bg-accent-red/5 focus:ring-accent-red/40'
      : 'border-paper-deep bg-paper focus:ring-pitch/50',
  ].join(' ')
}
