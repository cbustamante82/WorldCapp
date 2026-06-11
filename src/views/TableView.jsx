import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection, getEstado } from '../hooks/useCollection'
import { PAGINAS, LAMINAS } from '../data/laminas'
import { SELECCION_BY_ID } from '../data/selecciones'
import FlagImg from '../components/FlagImg'

const RECENT_COLOR = '#3b82f6'

const PAGE_DATA = PAGINAS.map((page) => ({
  ...page,
  laminas: LAMINAS
    .filter((l) => l.pageId === page.id)
    .sort((a, b) => a.positionInSheet - b.positionInSheet),
}))

function getPageColor(page) {
  if (page.type === 'fwc')        return '#d97706'
  if (page.type === 'coca-cola')  return '#dc2626'
  const team = SELECCION_BY_ID[page.sectionId]
  return team?.colors?.primary ?? '#166534'
}

export default function TableView() {
  const { map: estadoMap, setPegada } = useCollection()
  const navigate = useNavigate()
  const [recentlyMarked, setRecentlyMarked] = useState(() => new Set())

  const rows = useMemo(() =>
    PAGE_DATA.map((page) => {
      const pegadas = page.laminas.filter((l) => getEstado(estadoMap, l.id).pegada).length
      return { ...page, pegadas }
    }),
    [estadoMap],
  )

  function handleChipClick(laminaId, pegada) {
    if (!pegada) {
      setPegada(laminaId, true)
      setRecentlyMarked((prev) => new Set([...prev, laminaId]))
    } else if (recentlyMarked.has(laminaId)) {
      setPegada(laminaId, false)
      setRecentlyMarked((prev) => {
        const next = new Set(prev)
        next.delete(laminaId)
        return next
      })
    }
  }

  function handlePageClick(page) {
    navigate(`/album?seccion=${page.sectionId}`)
  }

  // Renderiza los recuadros de láminas (reutilizado en móvil y desktop)
  function Chips({ laminas, color }) {
    return laminas.map((l) => {
      const pegada    = getEstado(estadoMap, l.id).pegada
      const isRecent  = pegada && recentlyMarked.has(l.id)
      const chipColor = isRecent ? RECENT_COLOR : color
      const clickable = !pegada || isRecent
      return (
        <div
          key={l.id}
          title={`${l.number} · ${l.name}${isRecent ? ' (recién agregada — clic para quitar)' : !pegada ? ' (faltante — clic para pegar)' : ''}`}
          onClick={() => handleChipClick(l.id, pegada)}
          className={[
            'flex-shrink-0 w-10 md:w-12 lg:w-14 rounded px-1 md:px-1.5 lg:px-2 py-1.5 md:py-2 lg:py-2.5 text-center select-none transition-opacity',
            clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
          ].join(' ')}
          style={
            pegada
              ? { backgroundColor: chipColor }
              : { border: `1.5px solid ${chipColor}`, opacity: 0.5 }
          }
        >
          <p
            className="text-[9px] md:text-[11px] lg:text-xs font-bold leading-none tabular whitespace-nowrap"
            style={{ color: pegada ? '#ffffff' : chipColor }}
          >
            {l.number}
          </p>
        </div>
      )
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="brand-title text-4xl text-ink mb-1">Cartilla del álbum</h1>
      <p className="mb-6 text-sm text-ink-soft flex flex-wrap items-center gap-x-3 gap-y-1">
        {rows.length} páginas · cada recuadro es una lámina
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-5 rounded-sm bg-pitch" /> pegada
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-5 rounded-sm" style={{ backgroundColor: RECENT_COLOR }} /> recién agregada
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-5 rounded-sm border border-pitch opacity-50" /> faltante
        </span>
      </p>

      <div className="overflow-x-auto rounded-xl border border-paper-deep shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-paper-deep bg-paper-deep/60">
              <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-soft w-10">#</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-soft">Página</th>
              <th className="hidden md:table-cell px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-soft w-20">Pegadas</th>
              {/* Columna de láminas: solo visible en pantallas medianas+ */}
              <th className="hidden md:table-cell px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-soft">Láminas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((page, i) => {
              const color = getPageColor(page)
              const team  = SELECCION_BY_ID[page.sectionId]
              const pct   = page.laminas.length ? page.pegadas / page.laminas.length : 0

              return (
                <tr
                  key={page.id}
                  className={[
                    'border-b border-paper-deep',
                    i % 2 === 0 ? 'bg-paper' : 'bg-paper-deep/10',
                  ].join(' ')}
                >
                  <td className="px-3 py-2 text-xs tabular font-semibold text-ink-soft align-top">{page.number}</td>

                  {/* Nombre + chips en móvil */}
                  <td className="px-3 py-2 min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => handlePageClick(page)}
                      title={`Ir al álbum de ${team ? team.name : page.title}`}
                      className="flex w-full items-center gap-2 text-left group"
                    >
                      {team && (
                        <FlagImg iso2={team.iso2} name={team.name} size={20} className="flex-shrink-0 rounded-sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-semibold text-ink leading-none whitespace-nowrap group-hover:underline">
                            {team ? team.name : page.title}
                          </p>
                          <span
                            className="md:hidden text-xs font-bold tabular whitespace-nowrap"
                            style={{ color }}
                          >
                            {page.pegadas}/{page.laminas.length}
                          </span>
                        </div>
                        {team && (
                          <p className="text-[10px] text-ink-soft mt-0.5">
                            Grupo {team.group} · {team.confederation}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Barra de progreso */}
                    <div className="mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-paper-deep">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct * 100}%`, backgroundColor: color }}
                      />
                    </div>

                    {/* Chips: solo en móvil (debajo del nombre, máx 10 por fila) */}
                    <div
                      className="mt-2 grid gap-1 md:hidden"
                      style={{ gridTemplateColumns: 'repeat(5, max-content)' }}
                    >
                      <Chips laminas={page.laminas} color={color} />
                    </div>
                  </td>

                  <td className="hidden md:table-cell px-3 py-2 text-right whitespace-nowrap align-top">
                    <span className="font-bold tabular" style={{ color }}>{page.pegadas}</span>
                    <span className="text-ink-soft">/{page.laminas.length}</span>
                  </td>

                  {/* Chips: solo en desktop (columna propia, máx 10 por fila) */}
                  <td className="hidden md:table-cell px-3 py-2">
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: 'repeat(10, max-content)' }}
                    >
                      <Chips laminas={page.laminas} color={color} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
