// LaminaCard — Lámina individual del álbum.
// - Click vacío  → marcar pegada
// - Click pegada → sumar repetida
// - Botón ✕      → quitar (removeLamina)
// - Botón −      → restar repetida

import { TIPO_BY_ID } from '../data/tiposLamina'
import { SELECCION_BY_ID } from '../data/selecciones'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../auth/AuthContext'
import FlagImg from './FlagImg'

const SPECIAL_BACKGROUNDS = {
  fwc:        'linear-gradient(150deg, #3d2600 0%, #8a6300 60%, #5a3800 130%)',
  'coca-cola':'linear-gradient(150deg, #6b0000 0%, #cc0000 60%, #8b0000 130%)',
}

export default function LaminaCard({ lamina, estado, isFan }) {
  const { pegada, repetidas } = estado
  const tipo      = TIPO_BY_ID[lamina.tipoId]
  const seleccion = SELECCION_BY_ID[lamina.seleccionId]
  const isSpecial = lamina.tipoId === 'fwc' || lamina.tipoId === 'coca-cola'
  const { user }  = useAuth()
  const { setPegada, addRepetida, removeLamina } = useCollection()

  function handleMainClick() {
    if (!user) return
    if (!pegada) setPegada(lamina.id, true)
    else         addRepetida(lamina.id, 1)
  }
  function handleRemove(e) {
    e.stopPropagation()
    if (user) removeLamina(lamina.id)
  }
  function handleMinusRepetida(e) {
    e.stopPropagation()
    if (user) addRepetida(lamina.id, -1)
  }

  const pegadaBackground = isSpecial
    ? SPECIAL_BACKGROUNDS[lamina.tipoId] || SPECIAL_BACKGROUNDS.fwc
    : `linear-gradient(150deg, ${seleccion?.colors.primary || '#0e7a43'} 0%, ${seleccion?.colors.secondary || '#0a5c32'} 130%)`

  return (
    <div className={`group relative ${isFan && pegada ? 'fan-sticker-glow rounded-md' : ''}`}>
      <button
        type="button"
        onClick={handleMainClick}
        title={pegada ? 'Sumar repetida' : 'Marcar como pegada'}
        className={[
          'relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-md p-2 text-center transition',
          'aspect-[3/4] select-none',
          pegada
            ? 'animate-stick text-white shadow-sticker'
            : 'bg-slot text-ink-soft shadow-slot hover:bg-paper-deep',
        ].join(' ')}
        style={pegada ? { background: pegadaBackground } : undefined}
      >
        {pegada && (
          isSpecial
            ? (
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-6xl leading-none"
                style={{ opacity: 0.22 }}
                aria-hidden
              >
                ⭐
              </span>
            )
            : seleccion?.iso2 && (
              <FlagImg iso2={seleccion.iso2} name={seleccion.name} watermark />
            )
        )}

        <span className={['relative z-10 self-start rounded px-1.5 py-0.5 text-[10px] font-bold tabular',
          pegada ? 'bg-black/30 text-white' : 'bg-ink/10 text-ink-soft'].join(' ')}>
          {lamina.number}
        </span>

        <span className={['hidden sm:block absolute right-1 top-1 z-10 rounded px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide',
          pegada ? 'bg-white/20 text-white' : 'bg-ink/5 text-ink-soft/70'].join(' ')}>
          {tipo?.label}
        </span>

        <span className="relative z-10 flex flex-1 items-center justify-center">
          {pegada
            ? <span className="brand-title text-xl leading-none drop-shadow">✓</span>
            : <span className="hidden sm:inline brand-title text-base md:text-2xl lg:text-3xl leading-none text-slot-line opacity-60">{lamina.number}</span>
          }
        </span>

        <span className="hidden sm:block relative z-10 line-clamp-2 w-full text-[10px] font-semibold leading-tight">
          {lamina.name}
        </span>

        <span className={['sm:hidden relative z-10 w-full text-center text-[8px] font-semibold uppercase tracking-wide',
          pegada ? 'text-white/80' : 'text-ink-soft/70'].join(' ')}>
          {tipo?.label}
        </span>

        {repetidas > 0 && (
          <span className="absolute -right-2 -top-2 z-20 flex items-center gap-0.5 rounded-full bg-accent-gold px-2 pt-1.5 pb-1 text-[15px] font-bold text-ink shadow tabular">
            <span
              role="button"
              tabIndex={0}
              onClick={handleMinusRepetida}
              className="cursor-pointer px-0.5 leading-none hover:text-accent-red"
              title="Restar repetida"
            >
              −
            </span>
            ×{repetidas}
          </span>
        )}
      </button>

      {pegada && (
        <button
          type="button"
          onClick={handleRemove}
          title="Quitar lámina"
          className="absolute -left-1.5 -top-1.5 z-20 hidden h-5 w-5 items-center justify-center rounded-full bg-accent-red text-xs font-bold text-white shadow group-hover:flex"
        >
          ✕
        </button>
      )}
    </div>
  )
}
