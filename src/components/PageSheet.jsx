// PageSheet — Render fiel de una página/hoja del álbum.
// Coloca las láminas en una grilla de `gridCols` columnas, ordenadas por su
// posición física en la hoja (positionInSheet). Cabecera con sección y página.

import LaminaCard from './LaminaCard'
import { getEstado } from '../hooks/useCollection'
import { SECCION_BY_ID } from '../data/secciones'

export default function PageSheet({ page, laminas, estadoMap }) {
  const seccion = SECCION_BY_ID[page.sectionId]
  const ordered = [...laminas].sort((a, b) => a.positionInSheet - b.positionInSheet)
  const pegadas = ordered.filter((l) => getEstado(estadoMap, l.id).pegada).length

  return (
    <section className="mx-auto mb-10 max-w-3xl rounded-xl border border-paper-deep bg-paper bg-paper-grain p-5 shadow-sm">
      {/* Cabecera de hoja */}
      <header className="mb-4 flex items-end justify-between border-b-2 border-pitch/30 pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-pitch">
            {seccion?.name}
          </p>
          <h2 className="brand-title text-3xl text-ink">{page.title}</h2>
        </div>
        <div className="text-right">
          <p className="brand-title text-2xl text-ink/80 tabular">Pág. {page.number}</p>
          <p className="text-[11px] font-medium text-ink-soft tabular">
            {pegadas}/{ordered.length} pegadas
          </p>
        </div>
      </header>

      {/* Grilla de huecos */}
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${page.gridCols}, minmax(0, 1fr))` }}
      >
        {ordered.map((lamina) => (
          <LaminaCard key={lamina.id} lamina={lamina} estado={getEstado(estadoMap, lamina.id)} />
        ))}
      </div>
    </section>
  )
}
