import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { LAMINAS } from '../data/laminas'
import { SELECCION_BY_ID } from '../data/selecciones'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })
}

const ESTADO_STYLE = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobado:  'bg-green-100  text-green-800  border-green-200',
  rechazado: 'bg-red-100    text-red-700    border-red-200',
}
const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  aprobado:  'Aprobado',
  rechazado: 'Rechazado',
}

async function computeExchange(myId, otherId) {
  const [{ data: myData }, { data: theirData }] = await Promise.all([
    supabase.from('progreso_usuario').select('lamina_id, pegada, repetidas').eq('user_id', myId),
    supabase.from('progreso_usuario').select('lamina_id, pegada, repetidas').eq('user_id', otherId),
  ])
  const myMap    = {}
  const theirMap = {}
  for (const r of myData    ?? []) myMap[r.lamina_id]    = r
  for (const r of theirData ?? []) theirMap[r.lamina_id] = r

  // Mis repetidas que al otro le faltan
  const canGive = LAMINAS.filter(l =>
    (myMap[l.id]?.repetidas ?? 0) > 0 && !theirMap[l.id]?.pegada
  )
  // Sus repetidas que a mí me faltan
  const canReceive = LAMINAS.filter(l =>
    (theirMap[l.id]?.repetidas ?? 0) > 0 && !myMap[l.id]?.pegada
  )
  return { canGive, canReceive }
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function IntercambioView() {
  const { user } = useAuth()
  const [tab,            setTab]            = useState('recibidas')
  const [intercambios,   setIntercambios]   = useState([])
  const [loading,        setLoading]        = useState(true)
  const [loadingDetalle, setLoadingDetalle] = useState(null) // id del intercambio cargando
  const [detalle,        setDetalle]        = useState(null)

  const fetchIntercambios = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.rpc('mis_intercambios')
    setIntercambios(data ?? [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchIntercambios()
    const ch = supabase
      .channel('intercambios-watch')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'intercambios' },
        fetchIntercambios,
      )
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchIntercambios])

  async function aprobar(id) {
    await supabase.from('intercambios')
      .update({ estado: 'aprobado', updated_at: new Date().toISOString() })
      .eq('id', id)
    fetchIntercambios()
  }

  async function rechazar(id) {
    await supabase.from('intercambios')
      .update({ estado: 'rechazado', updated_at: new Date().toISOString() })
      .eq('id', id)
    fetchIntercambios()
  }

  async function abrirDetalle(ix) {
    const otherId = ix.es_solicitante ? ix.receptor_id : ix.solicitante_id
    setLoadingDetalle(ix.id)
    try {
      const data = await computeExchange(user.id, otherId)
      setDetalle({ ix, ...data })
    } finally {
      setLoadingDetalle(null)
    }
  }

  if (detalle) {
    return <DetalleIntercambio detalle={detalle} onBack={() => setDetalle(null)} />
  }

  const recibidas       = intercambios.filter(i => !i.es_solicitante)
  const enviadas        = intercambios.filter(i =>  i.es_solicitante)
  const pendientesCount = recibidas.filter(i => i.estado === 'pendiente').length

  const tabs = [
    { id: 'recibidas', label: pendientesCount ? `Recibidas (${pendientesCount})` : 'Recibidas' },
    { id: 'enviadas',  label: 'Enviadas' },
    { id: 'nueva',     label: '+ Nueva solicitud' },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="brand-title text-4xl text-ink mb-1">Intercambios</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Comparte tus repetidas y recibe las que te faltan de otros coleccionistas.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-paper-deep">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              '-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.id
                ? 'border-pitch text-ink'
                : 'border-transparent text-ink-soft hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="py-10 text-center text-sm text-ink-soft">Cargando...</p>
      )}

      {!loading && tab === 'recibidas' && (
        <ListaCards
          items={recibidas}
          empty="No tienes solicitudes recibidas."
          loadingDetalle={loadingDetalle}
          renderActions={(ix) => {
            if (ix.estado === 'pendiente') return (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => aprobar(ix.id)}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition-colors"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => rechazar(ix.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-accent-red hover:bg-red-50 transition-colors"
                >
                  Rechazar
                </button>
              </div>
            )
            if (ix.estado === 'aprobado') return (
              <button
                type="button"
                onClick={() => abrirDetalle(ix)}
                disabled={loadingDetalle === ix.id}
                className="rounded-lg bg-pitch px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {loadingDetalle === ix.id ? 'Cargando...' : 'Ver intercambio'}
              </button>
            )
            return null
          }}
        />
      )}

      {!loading && tab === 'enviadas' && (
        <ListaCards
          items={enviadas}
          empty="Aún no has enviado solicitudes."
          loadingDetalle={loadingDetalle}
          renderActions={(ix) => {
            if (ix.estado === 'aprobado') return (
              <button
                type="button"
                onClick={() => abrirDetalle(ix)}
                disabled={loadingDetalle === ix.id}
                className="rounded-lg bg-pitch px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              >
                {loadingDetalle === ix.id ? 'Cargando...' : 'Ver intercambio'}
              </button>
            )
            if (ix.estado === 'rechazado') return (
              <p className="text-xs text-accent-red font-medium">
                Este usuario no aceptó la solicitud.
              </p>
            )
            return null
          }}
        />
      )}

      {tab === 'nueva' && (
        <NuevaSolicitud
          userId={user?.id}
          intercambios={intercambios}
          onSent={() => { fetchIntercambios(); setTab('enviadas') }}
        />
      )}
    </div>
  )
}

// ─── Lista de cards ───────────────────────────────────────────────────────────
function ListaCards({ items, empty, renderActions }) {
  if (!items.length) {
    return <p className="py-10 text-center text-sm text-ink-soft">{empty}</p>
  }
  return (
    <div className="space-y-3">
      {items.map(ix => {
        const actions = renderActions(ix)
        return (
          <div key={ix.id} className="rounded-xl border border-paper-deep bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink truncate">{ix.otro_usuario_nombre}</p>
                <p className="text-xs text-ink-soft truncate">{ix.otro_usuario_email}</p>
                <p className="mt-1 text-[11px] text-ink-soft/70">{fmtFecha(ix.created_at)}</p>
              </div>
              <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${ESTADO_STYLE[ix.estado]}`}>
                {ESTADO_LABEL[ix.estado]}
              </span>
            </div>
            {actions && (
              <div className="mt-3 border-t border-paper-deep pt-3">
                {actions}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Nueva solicitud ──────────────────────────────────────────────────────────
function NuevaSolicitud({ userId, intercambios, onSent }) {
  const [email,    setEmail]    = useState('')
  const [searching,setSearching]= useState(false)
  const [found,    setFound]    = useState(null)
  const [error,    setError]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)

  async function handleSearch(e) {
    e?.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setSearching(true)
    setFound(null)
    setError('')

    const { data, error: rpcErr } = await supabase.rpc('buscar_usuario', { email_input: trimmed })
    setSearching(false)

    if (rpcErr || !data?.length) {
      setError('Usuario no encontrado. Verificá el email ingresado.')
      return
    }

    const found = data[0]
    const yaExiste = intercambios.find(
      i => i.solicitante_id === found.user_id || i.receptor_id === found.user_id
    )
    if (yaExiste) {
      setError('Ya tenés una solicitud activa con este usuario.')
      return
    }
    setFound(found)
  }

  async function handleSend() {
    if (!found) return
    setSending(true)
    const { error: insertErr } = await supabase.from('intercambios').insert({
      solicitante_id: userId,
      receptor_id: found.user_id,
    })
    setSending(false)
    if (insertErr) {
      setError('No se pudo enviar la solicitud. Intentá de nuevo.')
    } else {
      setSent(true)
      setTimeout(onSent, 1500)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-bold text-green-700">¡Solicitud enviada!</p>
        <p className="mt-1 text-sm text-green-600">
          Cuando {found?.nombre} la acepte, podrán ver las láminas disponibles para el intercambio.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-paper-deep bg-paper p-5">
        <h2 className="mb-4 font-semibold text-ink">Buscar usuario por email</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setFound(null); setError('') }}
            placeholder="email del otro usuario"
            className="flex-1 rounded-lg border border-paper-deep bg-paper-deep/40 px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-pitch/30"
          />
          <button
            type="submit"
            disabled={searching || !email.trim()}
            className="rounded-lg bg-pitch px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {searching ? '...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <p className="mt-2 text-sm font-medium text-accent-red">{error}</p>
        )}

        {found && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50/60 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{found.nombre}</p>
              <p className="text-xs text-ink-soft truncate">{found.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex-shrink-0 rounded-lg bg-pitch px-4 py-2 text-sm font-bold text-white transition disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-ink-soft">
        El otro usuario deberá aceptar la solicitud para que puedan ver las láminas disponibles para el intercambio.
      </p>
    </div>
  )
}

// ─── Detalle del intercambio ──────────────────────────────────────────────────
function DetalleIntercambio({ detalle, onBack }) {
  const { ix, canGive, canReceive } = detalle

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
      >
        ← Volver
      </button>

      <h1 className="brand-title text-3xl text-ink mb-0.5">Intercambio</h1>
      <p className="mb-6 text-sm text-ink-soft">
        con <span className="font-semibold text-ink">{ix.otro_usuario_nombre}</span>
        <span className="ml-1 text-ink-soft/70">· {ix.otro_usuario_email}</span>
      </p>

      <SeccionLaminas
        title="Lo que yo puedo aportar"
        subtitle={`Mis repetidas que a ${ix.otro_usuario_nombre} le faltan`}
        laminas={canGive}
        emptyMsg="No tienes repetidas que le falten a este usuario."
        colorClass="text-pitch"
      />

      <SeccionLaminas
        title="Lo que me pueden aportar"
        subtitle={`Las repetidas de ${ix.otro_usuario_nombre} que a mí me faltan`}
        laminas={canReceive}
        emptyMsg={`${ix.otro_usuario_nombre} no tiene repetidas que a ti te falten.`}
        colorClass="text-accent-gold"
      />
    </div>
  )
}

function SeccionLaminas({ title, subtitle, laminas, emptyMsg, colorClass }) {
  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-paper-deep bg-paper">
      <div className="border-b border-paper-deep px-4 py-3">
        <h2 className="font-bold text-ink">{title}</h2>
        <p className="text-xs text-ink-soft">{subtitle}</p>
        <p className={`mt-0.5 text-xs font-semibold tabular ${colorClass}`}>
          {laminas.length} lámina{laminas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {laminas.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-ink-soft">{emptyMsg}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 p-3">
          {laminas.map(l => {
            const sel = SELECCION_BY_ID[l.seleccionId]
            const bg  = sel?.colors?.primary ?? '#374151'
            return (
              <div
                key={l.id}
                title={`${l.number} · ${l.name}${sel ? ` (${sel.name})` : ''}`}
                className="rounded px-2 py-1 text-center"
                style={{ backgroundColor: bg }}
              >
                <p className="text-[10px] font-bold text-white tabular leading-none">{l.number}</p>
                {sel && (
                  <p className="mt-0.5 text-[8px] font-semibold uppercase text-white/70 leading-none">
                    {sel.tla}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
