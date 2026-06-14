import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { LAMINAS } from '../data/laminas'
import { SELECCION_BY_ID } from '../data/selecciones'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })
}

const ESTADO_STYLE = {
  pendiente:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobado:   'bg-green-100  text-green-800  border-green-200',
  rechazado:  'bg-red-100    text-red-700    border-red-200',
  completado: 'bg-blue-100   text-blue-800   border-blue-200',
}
const ESTADO_LABEL = {
  pendiente:  'Pendiente',
  aprobado:   'Aprobado',
  rechazado:  'Rechazado',
  completado: 'Completado',
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

  const canGive        = LAMINAS.filter(l => (myMap[l.id]?.repetidas    ?? 0) > 0 && !theirMap[l.id]?.pegada)
  const canReceive     = LAMINAS.filter(l => (theirMap[l.id]?.repetidas ?? 0) > 0 && !myMap[l.id]?.pegada)
  const myRepetidas    = LAMINAS.filter(l => (myMap[l.id]?.repetidas    ?? 0) > 0)
  const theirRepetidas = LAMINAS.filter(l => (theirMap[l.id]?.repetidas ?? 0) > 0)
  return { canGive, canReceive, myRepetidas, theirRepetidas }
}

// Resuelve las láminas de cada parte desde la perspectiva del usuario actual
function resolveConfirmadas(ix) {
  const misIds = ix.es_solicitante ? ix.laminas_solicitante : ix.laminas_receptor
  const susIds = ix.es_solicitante ? ix.laminas_receptor    : ix.laminas_solicitante
  return {
    misLaminas: LAMINAS.filter(l => (misIds ?? []).includes(l.id)),
    susLaminas: LAMINAS.filter(l => (susIds ?? []).includes(l.id)),
    yoConfirme: ix.es_solicitante ? ix.confirmado_solicitante : ix.confirmado_receptor,
    elConfirmo: ix.es_solicitante ? ix.confirmado_receptor    : ix.confirmado_solicitante,
  }
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function IntercambioView() {
  const { user } = useAuth()
  const [tab,            setTab]            = useState('recibidas')
  const [intercambios,   setIntercambios]   = useState([])
  const [loading,        setLoading]        = useState(true)
  const [loadingDetalle, setLoadingDetalle] = useState(null)
  const [detalle,        setDetalle]        = useState(null)
  const [confirmando,    setConfirmando]    = useState(false)

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
    if (ix.estado === 'completado') {
      const { misLaminas, susLaminas } = resolveConfirmadas(ix)
      setDetalle({ ix, canGive: misLaminas, canReceive: susLaminas, myRepetidas: [], theirRepetidas: [] })
      return
    }
    const otherId = ix.es_solicitante ? ix.receptor_id : ix.solicitante_id
    setLoadingDetalle(ix.id)
    try {
      const data = await computeExchange(user.id, otherId)
      setDetalle({ ix, ...data })
    } finally {
      setLoadingDetalle(null)
    }
  }

  function handleConfirmado() {
    setDetalle(null)
    setConfirmando(false)
    fetchIntercambios()
  }

  if (detalle) {
    if (confirmando) {
      return (
        <ConfirmarIntercambio
          ix={detalle.ix}
          canGive={detalle.canGive}
          myRepetidas={detalle.myRepetidas}
          onBack={() => setConfirmando(false)}
          onConfirmed={handleConfirmado}
        />
      )
    }
    const puedeConfirmar = detalle.ix.estado === 'aprobado' && !resolveConfirmadas(detalle.ix).yoConfirme
    return (
      <DetalleIntercambio
        detalle={detalle}
        onBack={() => setDetalle(null)}
        onConfirmar={puedeConfirmar ? () => setConfirmando(true) : null}
      />
    )
  }

  const recibidas       = intercambios.filter(i => !i.es_solicitante)
  const enviadas        = intercambios.filter(i =>  i.es_solicitante)
  const pendientesCount = recibidas.filter(i => i.estado === 'pendiente').length

  const tabs = [
    { id: 'recibidas', label: pendientesCount ? `Recibidas (${pendientesCount})` : 'Recibidas' },
    { id: 'enviadas',  label: 'Enviadas' },
    { id: 'nueva',     label: '+ Nueva solicitud' },
  ]

  function btnDetalle(ix) {
    return (
      <button
        type="button"
        onClick={() => abrirDetalle(ix)}
        disabled={loadingDetalle === ix.id}
        className="rounded-lg bg-pitch px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
      >
        {loadingDetalle === ix.id ? 'Cargando...' : 'Ver intercambio'}
      </button>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="brand-title text-4xl text-ink mb-1">Intercambios</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Comparte tus repetidas y recibe las que te faltan de otros coleccionistas.
      </p>

      <div className="mb-6 flex gap-1 border-b border-paper-deep">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={[
              '-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors',
              tab === t.id ? 'border-pitch text-ink' : 'border-transparent text-ink-soft hover:text-ink',
            ].join(' ')}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="py-10 text-center text-sm text-ink-soft">Cargando...</p>}

      {!loading && tab === 'recibidas' && (
        <ListaCards
          items={recibidas}
          empty="No tienes solicitudes recibidas."
          renderActions={(ix) => {
            if (ix.estado === 'pendiente') return (
              <div className="flex gap-2">
                <button type="button" onClick={() => aprobar(ix.id)}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition-colors">
                  Aprobar
                </button>
                <button type="button" onClick={() => rechazar(ix.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-accent-red hover:bg-red-50 transition-colors">
                  Rechazar
                </button>
              </div>
            )
            if (ix.estado === 'aprobado' || ix.estado === 'completado') return btnDetalle(ix)
            return null
          }}
        />
      )}

      {!loading && tab === 'enviadas' && (
        <ListaCards
          items={enviadas}
          empty="Aún no has enviado solicitudes."
          renderActions={(ix) => {
            if (ix.estado === 'aprobado' || ix.estado === 'completado') return btnDetalle(ix)
            if (ix.estado === 'rechazado') return (
              <p className="text-xs text-accent-red font-medium">Este usuario no aceptó la solicitud.</p>
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
              <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${ESTADO_STYLE[ix.estado] ?? ''}`}>
                {ESTADO_LABEL[ix.estado] ?? ix.estado}
              </span>
            </div>
            {actions && (
              <div className="mt-3 border-t border-paper-deep pt-3">{actions}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Nueva solicitud ──────────────────────────────────────────────────────────
function NuevaSolicitud({ userId, intercambios, onSent }) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searching,   setSearching]   = useState(false)
  const [showDrop,    setShowDrop]    = useState(false)
  const [selected,    setSelected]    = useState(null)
  const [error,       setError]       = useState('')
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); setShowDrop(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase.rpc('buscar_usuarios', { query_input: query.trim() })
      setSuggestions(data ?? [])
      setShowDrop(true)
      setSearching(false)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleSelect(u) {
    setShowDrop(false)
    setSuggestions([])
    setError('')
    const yaExiste = intercambios.find(
      i => (i.solicitante_id === u.user_id || i.receptor_id === u.user_id)
        && ['pendiente', 'aprobado'].includes(i.estado)
    )
    if (yaExiste) {
      setQuery(u.email)
      setSelected(null)
      setError('Ya tienes una solicitud activa con este usuario.')
      return
    }
    setSelected(u)
    setQuery(u.email)
  }

  async function handleSend() {
    if (!selected) return
    setSending(true)
    const { error: insertErr } = await supabase.from('intercambios').insert({
      solicitante_id: userId,
      receptor_id: selected.user_id,
    })
    setSending(false)
    if (insertErr) {
      setError('No se pudo enviar la solicitud. Inténtalo de nuevo.')
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
          Cuando {selected?.nombre} la acepte, podrán ver las láminas disponibles para el intercambio.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-paper-deep bg-paper p-5">
        <h2 className="mb-4 font-semibold text-ink">Buscar usuario</h2>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); setError('') }}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            placeholder="Nombre o email (mínimo 3 caracteres)"
            autoComplete="off"
            className="w-full rounded-lg border border-paper-deep bg-paper-deep/40 px-3 py-2 pr-8 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-pitch/30"
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-soft/60">···</span>
          )}
          {showDrop && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-paper-deep bg-paper shadow-lg">
              {suggestions.length > 0 ? suggestions.map(u => (
                <button key={u.user_id} type="button" onMouseDown={() => handleSelect(u)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-paper-deep">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pitch/10 text-xs font-bold text-pitch">
                    {u.nombre[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{u.nombre}</p>
                    <p className="truncate text-xs text-ink-soft">{u.email}</p>
                  </div>
                </button>
              )) : (
                <p className="px-4 py-3 text-center text-sm text-ink-soft">Sin resultados</p>
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm font-medium text-accent-red">{error}</p>}
        {selected && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50/60 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{selected.nombre}</p>
              <p className="truncate text-xs text-ink-soft">{selected.email}</p>
            </div>
            <button type="button" onClick={handleSend} disabled={sending}
              className="flex-shrink-0 rounded-lg bg-pitch px-4 py-2 text-sm font-bold text-white transition disabled:opacity-50">
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
function DetalleIntercambio({ detalle, onBack, onConfirmar }) {
  const { ix, canGive, canReceive } = detalle
  const completado = ix.estado === 'completado'
  const { misLaminas, susLaminas, yoConfirme, elConfirmo } = resolveConfirmadas(ix)

  // Para aprobado: si el otro ya confirmó, mostramos sus láminas almacenadas
  const laminasRecibir = (ix.estado === 'aprobado' && elConfirmo)
    ? susLaminas
    : canReceive

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button type="button" onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
        ← Volver
      </button>

      <h1 className="brand-title text-3xl text-ink mb-0.5">Intercambio</h1>
      <p className="mb-4 text-sm text-ink-soft">
        con <span className="font-semibold text-ink">{ix.otro_usuario_nombre}</span>
        <span className="ml-1 text-ink-soft/70">· {ix.otro_usuario_email}</span>
      </p>

      {/* Mis láminas */}
      <div className="mb-5 overflow-hidden rounded-xl border border-paper-deep bg-paper">
        <div className="flex items-start justify-between gap-2 border-b border-paper-deep px-4 py-3">
          <div>
            <h2 className="font-bold text-ink">
              {completado ? 'Láminas que di' : 'Mis láminas para dar'}
            </h2>
            <p className="text-xs text-ink-soft">
              {completado
                ? `Láminas que entregué a ${ix.otro_usuario_nombre}`
                : `Mis repetidas que a ${ix.otro_usuario_nombre} le faltan`}
            </p>
            <p className="mt-0.5 text-xs font-semibold tabular text-pitch">
              {(completado ? misLaminas : canGive).length} lámina{(completado ? misLaminas : canGive).length !== 1 ? 's' : ''}
            </p>
          </div>
          {yoConfirme && (
            <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-800 border border-green-200">
              Confirmadas
            </span>
          )}
        </div>
        <ChipsGrid laminas={completado ? misLaminas : (yoConfirme ? misLaminas : canGive)} />
        {!completado && !yoConfirme && (
          <div className="border-t border-paper-deep px-4 py-3">
            <p className="mb-2 text-xs text-ink-soft">
              Estas son tus repetidas disponibles. Puedes ajustarlas al confirmar.
            </p>
            <button type="button" onClick={onConfirmar}
              className="rounded-lg bg-pitch px-4 py-2 text-sm font-bold text-white hover:bg-pitch/90 transition-colors">
              Confirmar mis láminas
            </button>
          </div>
        )}
      </div>

      {/* Láminas del otro usuario */}
      <div className="mb-5 overflow-hidden rounded-xl border border-paper-deep bg-paper">
        <div className="flex items-start justify-between gap-2 border-b border-paper-deep px-4 py-3">
          <div>
            <h2 className="font-bold text-ink">
              {completado ? 'Láminas que recibí' : `Láminas de ${ix.otro_usuario_nombre}`}
            </h2>
            <p className="text-xs text-ink-soft">
              {completado
                ? `Láminas que recibí de ${ix.otro_usuario_nombre}`
                : `Sus repetidas que a mí me faltan`}
            </p>
            <p className="mt-0.5 text-xs font-semibold tabular text-accent-gold">
              {laminasRecibir.length} lámina{laminasRecibir.length !== 1 ? 's' : ''}
            </p>
          </div>
          {elConfirmo && (
            <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-800 border border-green-200">
              Confirmadas
            </span>
          )}
        </div>
        {!completado && !elConfirmo ? (
          <p className="px-4 py-4 text-center text-sm text-ink-soft">
            Esperando que {ix.otro_usuario_nombre} confirme sus láminas.
          </p>
        ) : (
          <ChipsGrid laminas={laminasRecibir} />
        )}
      </div>

      {completado && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center">
          <p className="text-sm font-bold text-blue-800">Intercambio completado</p>
          <p className="mt-0.5 text-xs text-blue-600">Ambos usuarios confirmaron sus láminas.</p>
        </div>
      )}
    </div>
  )
}

// ─── Confirmar intercambio (solo mis láminas) ─────────────────────────────────
function ConfirmarIntercambio({ ix, canGive, myRepetidas, onBack, onConfirmed }) {
  const [doy,    setDoy]    = useState(canGive)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  async function confirmar() {
    setSaving(true)
    setError('')
    const { error: err } = await supabase.rpc('confirmar_intercambio', {
      intercambio_id:      ix.id,
      laminas_confirmadas: doy.map(l => l.id),
    })
    setSaving(false)
    if (err) {
      setError('No se pudo confirmar. Inténtalo de nuevo.')
    } else {
      onConfirmed()
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button type="button" onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
        ← Volver al detalle
      </button>

      <h1 className="brand-title text-3xl text-ink mb-0.5">Mis láminas</h1>
      <p className="mb-1 text-sm text-ink-soft">
        Intercambio con <span className="font-semibold text-ink">{ix.otro_usuario_nombre}</span>
      </p>
      <p className="mb-6 text-xs text-ink-soft">
        Confirma las láminas que vas a dar. {ix.otro_usuario_nombre} confirma las suyas de forma independiente.
      </p>

      <LaminasEditables
        title="Láminas que doy"
        subtitle={`Mis repetidas para ${ix.otro_usuario_nombre}`}
        items={doy}
        available={myRepetidas}
        onRemove={(id) => setDoy(prev => prev.filter(l => l.id !== id))}
        onAdd={(l)     => setDoy(prev => [...prev, l])}
        colorClass="text-pitch"
        emptyMsg="No hay láminas seleccionadas para dar."
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-accent-red">
          {error}
        </p>
      )}

      <button type="button" onClick={confirmar} disabled={saving}
        className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50">
        {saving ? 'Confirmando...' : 'Confirmar mis láminas'}
      </button>
      <p className="mt-2 text-center text-xs text-ink-soft">
        Una vez que ambos confirmen, el intercambio quedará completado.
      </p>
    </div>
  )
}

// ─── Láminas editables (autocomplete, solo mis láminas) ───────────────────────
function LaminasEditables({ title, subtitle, items, available, onRemove, onAdd, colorClass, emptyMsg }) {
  const [query,    setQuery]    = useState('')
  const [showDrop, setShowDrop] = useState(false)

  const suggestions = query.length >= 3
    ? available
        .filter(l => !items.some(i => i.id === l.id))
        .filter(l =>
          l.number.toLowerCase().includes(query.toLowerCase()) ||
          l.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : []

  function handleAdd(l) {
    onAdd(l)
    setQuery('')
    setShowDrop(false)
  }

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-paper-deep bg-paper">
      <div className="border-b border-paper-deep px-4 py-3">
        <h2 className="font-bold text-ink">{title}</h2>
        <p className="text-xs text-ink-soft">{subtitle}</p>
        <p className={`mt-0.5 text-xs font-semibold tabular ${colorClass}`}>
          {items.length} lámina{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-4 text-center text-sm text-ink-soft">{emptyMsg}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 p-3">
          {items.map(l => {
            const sel = SELECCION_BY_ID[l.seleccionId]
            const bg  = sel?.colors?.primary ?? '#374151'
            return (
              <div key={l.id} className="group relative">
                <div title={`${l.number} · ${l.name}`} className="rounded px-2 py-1 text-center" style={{ backgroundColor: bg }}>
                  <p className="text-[10px] font-bold text-white tabular leading-none">{l.number}</p>
                  {sel && <p className="mt-0.5 text-[8px] font-semibold uppercase text-white/70 leading-none">{sel.tla}</p>}
                </div>
                <button type="button" onClick={() => onRemove(l.id)} title="Quitar"
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="relative border-t border-paper-deep px-3 pb-3 pt-2">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDrop(true) }}
          onFocus={() => query.length >= 3 && setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)}
          placeholder="Agregar lámina (mínimo 3 caracteres)..."
          autoComplete="off"
          className="w-full rounded-lg border border-paper-deep bg-paper-deep/40 px-3 py-1.5 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-pitch/30"
        />
        {showDrop && suggestions.length > 0 && (
          <div className="absolute left-3 right-3 top-full z-20 mt-0.5 max-h-48 overflow-y-auto rounded-lg border border-paper-deep bg-paper shadow-lg">
            {suggestions.map(l => (
              <button key={l.id} type="button" onMouseDown={() => handleAdd(l)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-paper-deep">
                <span className="w-14 flex-shrink-0 text-xs font-bold text-ink tabular">{l.number}</span>
                <span className="truncate text-xs text-ink-soft">{l.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Grid de chips (solo lectura) ─────────────────────────────────────────────
function ChipsGrid({ laminas }) {
  if (!laminas.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 p-3">
      {laminas.map(l => {
        const sel = SELECCION_BY_ID[l.seleccionId]
        const bg  = sel?.colors?.primary ?? '#374151'
        return (
          <div key={l.id} title={`${l.number} · ${l.name}${sel ? ` (${sel.name})` : ''}`}
            className="rounded px-2 py-1 text-center" style={{ backgroundColor: bg }}>
            <p className="text-[10px] font-bold text-white tabular leading-none">{l.number}</p>
            {sel && <p className="mt-0.5 text-[8px] font-semibold uppercase text-white/70 leading-none">{sel.tla}</p>}
          </div>
        )
      })}
    </div>
  )
}

// ─── Sección de láminas (solo lectura, con encabezado) ────────────────────────
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
      {laminas.length === 0
        ? <p className="px-4 py-6 text-center text-sm text-ink-soft">{emptyMsg}</p>
        : <ChipsGrid laminas={laminas} />
      }
    </div>
  )
}
