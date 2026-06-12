// GroupsView — Grupos, calendario con resultados en vivo, standings y rondas finales.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SELECCION_BY_ID } from '../data/selecciones'
import { useCollection } from '../hooks/useCollection'
import { LAMINAS } from '../data/laminas'
import { GROUP_FIXTURES, KNOCKOUT_ROUNDS } from '../data/fixtures'
import { fetchMatchData, computeStandings } from '../lib/matchApi'
import FlagImg from '../components/FlagImg'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const POLL_LIVE = 45_000   // 45 s cuando hay partido en curso
const POLL_IDLE = 5 * 60_000  // 5 min en reposo

function fmtDate(iso) {
  const [,m,d] = iso.split('-')
  const months = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${months[parseInt(m)]}`
}

function fmtTime(ts) {
  // "hace N seg/min"
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `hace ${diff}s`
  return `hace ${Math.floor(diff / 60)}min`
}

export default function GroupsView() {
  const navigate = useNavigate()
  const { map: estadoMap } = useCollection()
  const [tab, setTab]           = useState('grupos')
  const [activeGroup, setActiveGroup] = useState(null)

  // Estado de datos en vivo
  const [results,   setResults]   = useState({})   // 'MEX-RSA' → { g1, g2, status, minute }
  const [standings, setStandings] = useState({})   // 'A' → [{ tla, pts, ... }]
  const [hasLive,   setHasLive]   = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [apiOk,     setApiOk]     = useState(true)  // false si el endpoint no responde

  const loadData = useCallback(async () => {
    const data = await fetchMatchData()
    if (!data) { setApiOk(false); return }
    setApiOk(true)
    setResults(data.results)
    setHasLive(data.hasLive)
    setStandings(computeStandings(GROUP_FIXTURES, data.results))
    setUpdatedAt(Date.now())
  }, [])

  // Carga inicial + polling
  useEffect(() => {
    loadData()
    const id = setInterval(loadData, hasLive ? POLL_LIVE : POLL_IDLE)
    return () => clearInterval(id)
  }, [loadData, hasLive])

  // Indicador de tiempo desde última actualización
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 15_000)
    return () => clearInterval(id)
  }, [])

  function teamProgress(code) {
    const stickers = LAMINAS.filter((l) => l.seleccionId === code)
    const pegadas  = stickers.filter((l) => estadoMap[l.id]?.pegada).length
    return { pegadas, total: stickers.length, pct: stickers.length ? Math.round(pegadas / stickers.length * 100) : 0 }
  }

  const displayedGroups = activeGroup ? [activeGroup] : GROUPS

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="brand-title text-4xl text-ink">Mundial 2026</h1>
          <p className="text-sm text-ink-soft">12 grupos · 48 equipos · 104 partidos · 11 jun – 19 jul 2026</p>
        </div>

        {/* Estado API + refresh */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          {hasLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              EN VIVO
            </span>
          )}
          {updatedAt && apiOk && (
            <button
              type="button"
              onClick={loadData}
              className="text-[11px] text-ink-soft/60 hover:text-pitch transition"
              title="Actualizar resultados"
            >
              ↻ {fmtTime(updatedAt)}
            </button>
          )}
          {!apiOk && (
            <span className="text-[11px] text-amber-600">Sin datos en vivo</span>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 rounded-xl border border-paper-deep bg-paper-deep/50 p-1">
        {[
          { id: 'grupos',     label: '🏟 Grupos & Standings' },
          { id: 'calendario', label: '📅 Calendario' },
          { id: 'finales',    label: '🏆 Rondas Finales' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'flex-1 rounded-lg py-2 text-sm font-semibold transition',
              tab === t.id ? 'bg-pitch text-white shadow' : 'text-ink-soft hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: GRUPOS ══════════════════════════════════════════════════════ */}
      {tab === 'grupos' && (
        <>
          <GroupFilter active={activeGroup} onChange={setActiveGroup} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedGroups.map((gid) => (
              <GroupCard
                key={gid}
                gid={gid}
                teamProgress={teamProgress}
                navigate={navigate}
                groupStandings={standings[gid] ?? null}
              />
            ))}
          </div>
        </>
      )}

      {/* ══ TAB: CALENDARIO ══════════════════════════════════════════════════ */}
      {tab === 'calendario' && (
        <>
          <GroupFilter active={activeGroup} onChange={setActiveGroup} prefix="Grupo " />
          <div className="space-y-6">
            {displayedGroups.map((gid) => (
              <FixtureGroup key={gid} gid={gid} results={results} />
            ))}
          </div>
        </>
      )}

      {/* ══ TAB: RONDAS FINALES ══════════════════════════════════════════════ */}
      {tab === 'finales' && (
        <div className="space-y-4">
          <p className="mb-2 text-sm text-ink-soft">
            Los 32 clasificados (top 2 de cada grupo + 8 mejores terceros) disputan la fase eliminatoria.
          </p>
          {KNOCKOUT_ROUNDS.map((r) => (
            <KnockoutRound key={r.round} round={r} />
          ))}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            ⚠️ Los emparejamientos de la fase eliminatoria se determinarán al finalizar la fase de grupos (desde el 28 de junio).
          </div>
        </div>
      )}
    </div>
  )
}

// ── Filtro de grupo ──────────────────────────────────────────────────────────
function GroupFilter({ active, onChange, prefix = '' }) {
  return (
    <div className="mb-5 flex flex-wrap gap-1.5">
      <FilterBtn active={!active} onClick={() => onChange(null)}>Todos</FilterBtn>
      {GROUPS.map((g) => (
        <FilterBtn key={g} active={active === g} onClick={() => onChange(g === active ? null : g)}>
          {prefix}{g}
        </FilterBtn>
      ))}
    </div>
  )
}

// ── Tarjeta de grupo: standings + progreso álbum ─────────────────────────────
function GroupCard({ gid, teamProgress, navigate, groupStandings }) {
  const fixtures   = GROUP_FIXTURES[gid]
  const allTeams   = [...new Set(fixtures.flatMap((f) => [f.team1, f.team2]))]
  // Ordena los equipos por standings si existe, si no por orden de aparición
  const teamOrder  = groupStandings ? groupStandings.map((r) => r.tla) : allTeams

  return (
    <div className="overflow-hidden rounded-xl border border-paper-deep bg-paper shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-pitch px-4 py-2.5">
        <span className="brand-title text-2xl text-white">Grupo {gid}</span>
        <span className="text-xs text-white/70">4 equipos</span>
      </div>

      {/* ── Standings ─────────────────────────────────────────────────────── */}
      <StandingsTable rows={groupStandings ?? allTeams.map((t) => ({ tla: t, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }))} />

      {/* ── Progreso álbum ────────────────────────────────────────────────── */}
      <div className="border-t border-paper-deep">
        <div className="bg-paper-deep/40 px-4 py-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-soft/70">Láminas</span>
        </div>
        <div className="divide-y divide-paper-deep">
          {teamOrder.map((code) => {
            const team = SELECCION_BY_ID[code]
            const prog = teamProgress(code)
            return (
              <div
                key={code}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-paper-deep"
                onClick={() => navigate(`/album?seccion=${code}`)}
                title={`Ver álbum de ${team?.name}`}
              >
                <FlagImg iso2={team?.iso2} name={team?.name ?? code} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{team?.name ?? code}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold tabular text-pitch">{prog.pegadas}/{prog.total}</p>
                  <div className="mt-0.5 h-1.5 w-14 overflow-hidden rounded-full bg-paper-deep">
                    <div className="h-full rounded-full bg-pitch" style={{ width: `${prog.pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Tabla de posiciones compacta ─────────────────────────────────────────────
function StandingsTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-paper-deep/60 text-ink-soft/80">
            <th className="w-5 py-1.5 pl-3 text-center font-semibold">#</th>
            <th className="py-1.5 pl-2 text-left font-semibold">Equipo</th>
            <th className="w-7 py-1.5 text-center font-semibold" title="Jugados">PJ</th>
            <th className="w-7 py-1.5 text-center font-semibold" title="Ganados">G</th>
            <th className="w-7 py-1.5 text-center font-semibold" title="Empates">E</th>
            <th className="w-7 py-1.5 text-center font-semibold" title="Perdidos">P</th>
            <th className="w-9 py-1.5 text-center font-semibold" title="Diferencia de goles">DG</th>
            <th className="w-8 pr-3 py-1.5 text-center font-semibold" title="Puntos">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const team = SELECCION_BY_ID[row.tla]
            const isQ  = i < 2  // top 2 clasifican directamente
            const is3  = i === 2 // 3ro puede clasificar como mejor tercero
            return (
              <tr
                key={row.tla}
                className={[
                  'border-t border-paper-deep',
                  isQ ? 'bg-green-50' : is3 ? 'bg-amber-50/60' : '',
                ].join(' ')}
              >
                <td className="py-1.5 pl-3 text-center font-bold text-ink-soft">{i + 1}</td>
                <td className="py-1.5 pl-2">
                  <div className="flex items-center gap-1.5">
                    {isQ && <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" title="Clasifica" />}
                    {is3 && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Posible clasificado" />}
                    {!isQ && !is3 && <span className="h-1.5 w-1.5 flex-shrink-0" />}
                    <FlagImg iso2={team?.iso2} name={team?.name ?? row.tla} size={16} />
                    <span className="truncate font-semibold text-ink" style={{ maxWidth: 72 }}>
                      {team?.name ?? row.tla}
                    </span>
                  </div>
                </td>
                <td className="py-1.5 text-center tabular text-ink-soft">{row.played}</td>
                <td className="py-1.5 text-center tabular text-ink-soft">{row.won}</td>
                <td className="py-1.5 text-center tabular text-ink-soft">{row.draw}</td>
                <td className="py-1.5 text-center tabular text-ink-soft">{row.lost}</td>
                <td className={[
                  'py-1.5 text-center tabular font-medium',
                  row.gd > 0 ? 'text-green-700' : row.gd < 0 ? 'text-red-600' : 'text-ink-soft',
                ].join(' ')}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="py-1.5 pr-3 text-center font-bold text-ink tabular">{row.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Partidos de un grupo con resultados en vivo ──────────────────────────────
function FixtureGroup({ gid, results }) {
  const fixtures = GROUP_FIXTURES[gid]
  const byMd     = [1, 2, 3].map((md) => ({ md, matches: fixtures.filter((f) => f.md === md) }))

  return (
    <div className="overflow-hidden rounded-xl border border-paper-deep bg-paper shadow-sm">
      <div className="flex items-center justify-between bg-pitch px-4 py-2.5">
        <span className="brand-title text-xl text-white">Grupo {gid}</span>
        <span className="text-xs text-white/60">6 partidos</span>
      </div>

      {byMd.map(({ md, matches }) => (
        <div key={md}>
          <div className="bg-paper-deep/60 px-4 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-soft">
              Fecha {md} — {matches[0] && fmtDate(matches[0].date)}
            </span>
          </div>
          {matches.map((m, i) => (
            <MatchRow
              key={i}
              match={m}
              liveResult={results[`${m.team1}-${m.team2}`] ?? null}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Fila de partido ──────────────────────────────────────────────────────────
function MatchRow({ match, liveResult }) {
  const t1 = SELECCION_BY_ID[match.team1]
  const t2 = SELECCION_BY_ID[match.team2]

  // Prioridad: datos de la API > datos estáticos del archivo
  const res = liveResult ?? match.result ?? null

  const isLive     = ['IN_PLAY', 'PAUSED', 'HALF_TIME'].includes(res?.status)
  const isFinished = res?.status === 'FINISHED' || (res && res.g1 !== null && !isLive)
  const hasScore   = res?.g1 !== null && res?.g2 !== null

  return (
    <div className={[
      'flex items-center gap-2 border-t border-paper-deep px-3 py-2.5 transition-colors',
      isLive ? 'bg-red-50/50' : '',
    ].join(' ')}>

      {/* Equipo local */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="truncate text-sm font-semibold text-ink text-right">
          {t1?.name ?? match.team1}
        </span>
        <FlagImg iso2={t1?.iso2} name={t1?.name ?? match.team1} size={28} />
      </div>

      {/* Centro: marcador / LIVE / fecha */}
      <div className="flex w-20 flex-shrink-0 flex-col items-center gap-0.5">
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-600">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            {res.minute ? `${res.minute}'` : 'LIVE'}
          </span>
        )}
        {hasScore ? (
          <span className={[
            'brand-title text-lg tabular',
            isLive    ? 'text-red-700'  :
            isFinished ? 'text-ink'     : 'text-ink-soft',
          ].join(' ')}>
            {res.g1}–{res.g2}
          </span>
        ) : (
          <span className="rounded-md bg-paper-deep px-2 py-0.5 text-xs font-bold uppercase text-ink-soft">
            vs
          </span>
        )}
        {isFinished && !isLive && (
          <span className="text-[10px] text-ink-soft/60">Final</span>
        )}
      </div>

      {/* Equipo visitante */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FlagImg iso2={t2?.iso2} name={t2?.name ?? match.team2} size={28} />
        <span className="truncate text-sm font-semibold text-ink">
          {t2?.name ?? match.team2}
        </span>
      </div>

      {/* Ciudad (solo desktop) */}
      <span className="hidden w-28 flex-shrink-0 truncate text-right text-[11px] text-ink-soft/70 sm:block">
        {match.city}
      </span>
    </div>
  )
}

// ── Ronda final ──────────────────────────────────────────────────────────────
function KnockoutRound({ round: r }) {
  return (
    <div className="rounded-xl border border-paper-deep bg-paper p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="brand-title text-xl text-ink">{r.round}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{r.dates}</p>
          {r.note && <p className="mt-1 text-xs text-ink-soft/70">{r.note}</p>}
        </div>
        <div className="flex-shrink-0 rounded-lg bg-pitch/10 px-3 py-1.5 text-center">
          <p className="brand-title text-2xl text-pitch">{r.matches}</p>
          <p className="text-[10px] uppercase tracking-wide text-pitch/70">
            partido{r.matches > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      {r.cities && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.cities.map((c) => (
            <span key={c} className="rounded-full border border-paper-deep bg-paper-deep/50 px-2.5 py-0.5 text-[11px] text-ink-soft">
              📍 {c}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-xs font-semibold transition',
        active
          ? 'bg-pitch text-white'
          : 'border border-paper-deep bg-paper text-ink-soft hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
