// SectionsView — Vista de secciones especiales: FWC y Coca-Cola.
// FWC: fondo retro dorado/vintage. CC: fondo rojo/negro.

import LaminaCard from '../components/LaminaCard'
import { useCollection, getEstado } from '../hooks/useCollection'
import { LAMINAS, PAGINAS } from '../data/laminas'

const FWC_PAGES  = PAGINAS.filter((p) => p.type === 'fwc')
const CC_PAGES   = PAGINAS.filter((p) => p.type === 'coca-cola')

export default function SectionsView() {
  const { map: estadoMap } = useCollection()

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-10">
      <div>
        <h1 className="brand-title text-4xl text-ink">Secciones especiales</h1>
        <p className="text-sm text-ink-soft">Láminas FWC mundialistas y estrellas Coca-Cola</p>
      </div>

      {/* FWC — Especiales mundialistas */}
      {FWC_PAGES.map((page) => {
        const laminas = LAMINAS.filter((l) => l.pageId === page.id)
        const pegadas = laminas.filter((l) => getEstado(estadoMap, l.id).pegada).length
        return (
          <SpecialPageSheet
            key={page.id}
            page={page}
            laminas={laminas}
            estadoMap={estadoMap}
            pegadas={pegadas}
            variant="fwc"
          />
        )
      })}

      {/* CC — Coca-Cola Stars */}
      {CC_PAGES.map((page) => {
        const laminas = LAMINAS.filter((l) => l.pageId === page.id)
        const pegadas = laminas.filter((l) => getEstado(estadoMap, l.id).pegada).length
        return (
          <SpecialPageSheet
            key={page.id}
            page={page}
            laminas={laminas}
            estadoMap={estadoMap}
            pegadas={pegadas}
            variant="coca-cola"
          />
        )
      })}
    </div>
  )
}

function SpecialPageSheet({ page, laminas, estadoMap, pegadas, variant }) {
  const isFWC = variant === 'fwc'
  const ordered = [...laminas].sort((a, b) => a.positionInSheet - b.positionInSheet)

  const bgStyle = isFWC
    ? { background: 'linear-gradient(135deg, #2c1a00 0%, #5a3800 40%, #3d2600 100%)' }
    : { background: 'linear-gradient(135deg, #1a0000 0%, #8b0000 50%, #cc0000 100%)' }

  const titleColor = isFWC ? 'text-amber-300' : 'text-red-200'
  const badgeStyle = isFWC
    ? { background: 'rgba(255,200,50,0.15)', border: '1px solid rgba(255,200,50,0.4)', color: '#fde68a' }
    : { background: 'rgba(255,50,50,0.15)',  border: '1px solid rgba(255,50,50,0.4)',  color: '#fca5a5' }

  return (
    <section
      className="rounded-2xl p-6 shadow-xl"
      style={bgStyle}
    >
      {/* Cabecera */}
      <header className="mb-5 flex items-end justify-between border-b border-white/20 pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: isFWC ? '#fde68a' : '#fca5a5' }}>
            {isFWC ? '⭐ FIFA World Cup 2026' : '🥤 Coca-Cola Stars'}
          </p>
          <h2 className={`brand-title text-3xl ${titleColor}`}>{page.title}</h2>
        </div>
        <div
          className="rounded-lg px-3 py-1.5 text-right"
          style={badgeStyle}
        >
          <p className="brand-title text-2xl tabular">{pegadas}/{ordered.length}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide">pegadas</p>
        </div>
      </header>

      {/* Grilla */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${page.gridCols}, minmax(0, 1fr))` }}
      >
        {ordered.map((lamina) => (
          <LaminaCard
            key={lamina.id}
            lamina={lamina}
            estado={getEstado(estadoMap, lamina.id)}
            variant={variant}
          />
        ))}
      </div>
    </section>
  )
}
