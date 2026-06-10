// ExploreView — Vista (3) Exploración.
// Filtros por tipo de lámina y por país (selección), y ranking de las figuras más
// relevantes de los últimos 4 años a partir de FIGURA_RANKING (varias fuentes/años).

import { useMemo, useState } from 'react'
import { useCollection, getEstado } from '../hooks/useCollection'
import { LAMINAS, LAMINA_BY_ID } from '../data/laminas'
import { SELECCIONES, SELECCION_BY_ID } from '../data/selecciones'
import { TIPOS_LAMINA, TIPO_BY_ID } from '../data/tiposLamina'
import { FIGURA_RANKING } from '../data/figuraRanking'

// Ventana de relevancia: últimos 4 años respecto del año en curso.
const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = CURRENT_YEAR - 4

// Agrega el ranking por lámina dentro de la ventana de años.
function buildRanking(seleccionFilter) {
  const byLamina = new Map()
  for (const r of FIGURA_RANKING) {
    if (r.year < MIN_YEAR) continue
    const lamina = LAMINA_BY_ID[r.laminaId]
    if (!lamina) continue
    if (seleccionFilter !== 'all' && lamina.seleccionId !== seleccionFilter) continue

    if (!byLamina.has(r.laminaId)) {
      byLamina.set(r.laminaId, {
        laminaId: r.laminaId,
        name: lamina.name,
        seleccionId: lamina.seleccionId,
        peak: 0,
        sources: [],
      })
    }
    const agg = byLamina.get(r.laminaId)
    agg.peak = Math.max(agg.peak, r.score)
    agg.sources.push({ source: r.source, year: r.year, score: r.score })
  }
  return [...byLamina.values()]
    .sort((a, b) => b.peak - a.peak || b.sources.length - a.sources.length)
}

export default function ExploreView() {
  const { map: estadoMap } = useCollection()
  const [tipoFilter, setTipoFilter] = useState('all')
  const [seleccionFilter, setSeleccionFilter] = useState('all')

  const laminasFiltradas = useMemo(() => {
    return LAMINAS.filter((l) => {
      if (tipoFilter !== 'all' && l.tipoId !== tipoFilter) return false
      if (seleccionFilter !== 'all' && l.seleccionId !== seleccionFilter) return false
      return true
    })
  }, [tipoFilter, seleccionFilter])

  const ranking = useMemo(() => buildRanking(seleccionFilter), [seleccionFilter])
  const maxPeak = ranking.length ? ranking[0].peak : 100

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="brand-title text-4xl text-ink">Exploración</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Filtra el álbum y descubre las figuras más relevantes de los últimos 4 años (
        {MIN_YEAR}–{CURRENT_YEAR}).
      </p>

      {/* Filtros */}
      <div className="mb-8 flex flex-wrap gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
            Tipo de lámina
          </label>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="rounded-md border border-paper-deep bg-paper px-3 py-1.5 text-sm"
          >
            <option value="all">Todos</option>
            {TIPOS_LAMINA.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
            País
          </label>
          <select
            value={seleccionFilter}
            onChange={(e) => setSeleccionFilter(e.target.value)}
            className="rounded-md border border-paper-deep bg-paper px-3 py-1.5 text-sm"
          >
            <option value="all">Todos</option>
            {SELECCIONES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ranking de figuras */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-ink-soft">
            Ranking de figuras
          </h2>
          <ol className="space-y-2">
            {ranking.map((fig, i) => {
              const seleccion = SELECCION_BY_ID[fig.seleccionId]
              const pegada = getEstado(estadoMap, fig.laminaId).pegada
              return (
                <li
                  key={fig.laminaId}
                  className="rounded-lg border border-paper-deep bg-paper p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="brand-title w-8 text-2xl text-pitch tabular">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-ink">{fig.name}</p>
                        <span className="text-xs font-medium text-ink-soft">{seleccion?.name}</span>
                      </div>
                      {/* Barra de relevancia (pico) */}
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slot">
                        <div
                          className="h-full rounded-full bg-pitch"
                          style={{ width: `${(fig.peak / maxPeak) * 100}%` }}
                        />
                      </div>
                      {/* Fuentes/años */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {fig.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-paper-deep px-1.5 py-0.5 text-[10px] font-medium text-ink-soft"
                          >
                            {s.source} · {s.year}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        pegada ? 'bg-pitch/15 text-pitch' : 'bg-accent-red/10 text-accent-red',
                      ].join(' ')}
                    >
                      {pegada ? 'Pegada' : 'Faltante'}
                    </span>
                  </div>
                </li>
              )
            })}
            {ranking.length === 0 && (
              <li className="rounded-lg border border-dashed border-paper-deep p-4 text-center text-sm text-ink-soft">
                Sin figuras en el ranking para este filtro.
              </li>
            )}
          </ol>
        </section>

        {/* Láminas filtradas */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-ink-soft">
            Láminas ({laminasFiltradas.length})
          </h2>
          <div className="max-h-[32rem] space-y-1.5 overflow-auto pr-1">
            {laminasFiltradas.map((l) => {
              const tipo = TIPO_BY_ID[l.tipoId]
              const seleccion = SELECCION_BY_ID[l.seleccionId]
              const pegada = getEstado(estadoMap, l.id).pegada
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-md border border-paper-deep bg-paper px-3 py-2"
                >
                  <span className="w-8 text-sm font-bold tabular text-ink-soft">{l.number}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{l.name}</p>
                    <p className="text-[11px] text-ink-soft">
                      {seleccion?.name} · {tipo?.label}
                    </p>
                  </div>
                  <span
                    className={[
                      'h-2.5 w-2.5 rounded-full',
                      pegada ? 'bg-pitch' : 'bg-slot-line',
                    ].join(' ')}
                    title={pegada ? 'Pegada' : 'Faltante'}
                  />
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
