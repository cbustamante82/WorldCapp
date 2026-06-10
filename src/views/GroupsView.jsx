// GroupsView — Grupos del Mundial 2026 + calendario de partidos + rondas finales.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SELECCION_BY_ID } from '../data/selecciones'
import { useCollection } from '../hooks/useCollection'
import { LAMINAS } from '../data/laminas'
import { GROUP_FIXTURES, KNOCKOUT_ROUNDS } from '../data/fixtures'
import FlagImg from '../components/FlagImg'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// Formatea "2026-06-11" → "11 jun"
function fmtDate(iso) {
  const [,m,d] = iso.split('-')
  const months = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d)} ${months[parseInt(m)]}`
}

export default function GroupsView() {
  const navigate   = useNavigate()
  const { map: estadoMap } = useCollection()
  const [tab, setTab]           = useState('grupos')   // 'grupos' | 'calendario' | 'finales'
  const [activeGroup, setActiveGroup] = useState(null)

  function teamProgress(code) {
    const stickers = LAMINAS.filter((l) => l.seleccionId === code)
    const pegadas  = stickers.filter((l) => estadoMap[l.id]?.pegada).length
    return { pegadas, total: stickers.length, pct: stickers.length ? Math.round(pegadas/stickers.length*100) : 0 }
  }

  const displayedGroups = activeGroup ? [activeGroup] : GROUPS

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5">
        <h1 className="brand-title text-4xl text-ink">Mundial 2026</h1>
        <p className="text-sm text-ink-soft">12 grupos · 48 equipos · 104 partidos · 11 jun – 19 jul 2026</p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 rounded-xl border border-paper-deep bg-paper-deep/50 p-1">
        {[
          { id: 'grupos',     label: '🏟 Grupos & Progreso' },
          { id: 'calendario', label: '📅 Calendario' },
          { id: 'finales',    label: '🏆 Rondas Finales' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'flex-1 rounded-lg py-2 text-sm font-semibold transition',
              tab === t.id
                ? 'bg-pitch text-white shadow'
                : 'text-ink-soft hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: GRUPOS ══════════════════════════════════════════════════════ */}
      {tab === 'grupos' && (
        <>
          {/* Filtro */}
          <div className="mb-5 flex flex-wrap gap-1.5">
            <FilterBtn active={!activeGroup} onClick={() => setActiveGroup(null)}>Todos</FilterBtn>
            {GROUPS.map((g) => (
              <FilterBtn key={g} active={activeGroup === g} onClick={() => setActiveGroup(g === activeGroup ? null : g)}>
                {g}
              </FilterBtn>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedGroups.map((gid) => (
              <GroupCard key={gid} gid={gid} teamProgress={teamProgress} navigate={navigate} />
            ))}
          </div>
        </>
      )}

      {/* ══ TAB: CALENDARIO ══════════════════════════════════════════════════ */}
      {tab === 'calendario' && (
        <>
          {/* Filtro de grupo */}
          <div className="mb-5 flex flex-wrap gap-1.5">
            <FilterBtn active={!activeGroup} onClick={() => setActiveGroup(null)}>Todos los grupos</FilterBtn>
            {GROUPS.map((g) => (
              <FilterBtn key={g} active={activeGroup === g} onClick={() => setActiveGroup(g === activeGroup ? null : g)}>
                Grupo {g}
              </FilterBtn>
            ))}
          </div>

          <div className="space-y-6">
            {displayedGroups.map((gid) => (
              <FixtureGroup key={gid} gid={gid} />
            ))}
          </div>
        </>
      )}

      {/* ══ TAB: RONDAS FINALES ══════════════════════════════════════════════ */}
      {tab === 'finales' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft mb-2">
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

// ── Tarjeta de grupo con equipos y progreso ──────────────────────────────────
function GroupCard({ gid, teamProgress, navigate }) {
  const teams = GROUP_FIXTURES[gid].filter((f) => f.md === 1).flatMap((f) => [f.team1, f.team2])
  const uniqueTeams = [...new Set(teams)]

  return (
    <div className="overflow-hidden rounded-xl border border-paper-deep bg-paper shadow-sm">
      <div className="bg-pitch px-4 py-2.5 flex items-center justify-between">
        <span className="brand-title text-2xl text-white">Grupo {gid}</span>
        <span className="text-xs text-white/70">4 equipos</span>
      </div>
      <div className="divide-y divide-paper-deep">
        {uniqueTeams.map((code) => {
          const team = SELECCION_BY_ID[code]
          const prog = teamProgress(code)
          return (
            <div
              key={code}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-deep"
              onClick={() => navigate(`/album?seccion=${code}`)}
              title={`Ver álbum de ${team?.name}`}
            >
              <FlagImg iso2={team?.iso2} name={team?.name ?? code} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{team?.name ?? code}</p>
                <p className="text-[11px] text-ink-soft">{code} · {team?.confederation}</p>
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
  )
}

// ── Partidos de un grupo ─────────────────────────────────────────────────────
function FixtureGroup({ gid }) {
  const fixtures = GROUP_FIXTURES[gid]
  const byMd = [1,2,3].map((md) => ({ md, matches: fixtures.filter((f) => f.md === md) }))

  return (
    <div className="rounded-xl border border-paper-deep bg-paper overflow-hidden shadow-sm">
      <div className="bg-pitch px-4 py-2.5 flex items-center justify-between">
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
          {matches.map((m, i) => <MatchRow key={i} match={m} />)}
        </div>
      ))}
    </div>
  )
}

// ── Fila de partido ──────────────────────────────────────────────────────────
function MatchRow({ match }) {
  const t1  = SELECCION_BY_ID[match.team1]
  const t2  = SELECCION_BY_ID[match.team2]
  const res = match.result

  return (
    <div className="flex items-center gap-2 border-t border-paper-deep px-4 py-2.5">
      {/* Equipo 1 */}
      <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
        <span className="truncate text-sm font-semibold text-ink text-right">{t1?.name ?? match.team1}</span>
        <FlagImg iso2={t1?.iso2} name={t1?.name ?? match.team1} size={28} />
      </div>

      {/* Marcador o "vs" */}
      <div className="flex-shrink-0 w-16 text-center">
        {res ? (
          <span className="brand-title text-lg text-ink tabular">{res.g1}–{res.g2}</span>
        ) : (
          <span className="rounded-md bg-paper-deep px-2 py-0.5 text-xs font-bold uppercase text-ink-soft">vs</span>
        )}
      </div>

      {/* Equipo 2 */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <FlagImg iso2={t2?.iso2} name={t2?.name ?? match.team2} size={28} />
        <span className="truncate text-sm font-semibold text-ink">{t2?.name ?? match.team2}</span>
      </div>

      {/* Ciudad */}
      <span className="hidden sm:block text-[11px] text-ink-soft/70 text-right flex-shrink-0 w-28 truncate">
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
          <p className="text-sm text-ink-soft mt-0.5">{r.dates}</p>
          {r.note && <p className="text-xs text-ink-soft/70 mt-1">{r.note}</p>}
        </div>
        <div className="rounded-lg bg-pitch/10 px-3 py-1.5 text-center flex-shrink-0">
          <p className="brand-title text-2xl text-pitch">{r.matches}</p>
          <p className="text-[10px] uppercase tracking-wide text-pitch/70">partido{r.matches > 1 ? 's' : ''}</p>
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
        active ? 'bg-pitch text-white' : 'border border-paper-deep bg-paper text-ink-soft hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
