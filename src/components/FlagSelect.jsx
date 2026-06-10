// FlagSelect — Dropdown personalizado con banderas/imágenes por opción.
// Reemplaza <select> cuando se necesitan imágenes en las opciones.

import { useState, useRef, useEffect } from 'react'
import FlagImg from './FlagImg'

// props:
//   options   : [{ value, label, iso2?, imgUrl? }]
//     iso2    → bandera vía flagcdn.com
//     imgUrl  → imagen arbitraria (CDN, data URI, etc.)
//     (ninguno) → spacer invisible para mantener alineación
//   value     : string/number (value seleccionado)
//   onChange  : (value) => void
//   placeholder: string
//   error     : bool
//   disabled  : bool

function OptImg({ opt, size = 20 }) {
  if (opt.iso2) {
    return <FlagImg iso2={opt.iso2} name={opt.label} size={size} className="flex-shrink-0 rounded-sm shadow-sm" />
  }
  if (opt.imgUrl) {
    return (
      <img
        src={opt.imgUrl}
        alt={opt.label}
        width={size}
        height={size}
        className="flex-shrink-0 rounded-sm"
        style={{ objectFit: 'contain' }}
      />
    )
  }
  return <span className="inline-block flex-shrink-0" style={{ width: size }} />
}

export default function FlagSelect({ options, value, onChange, placeholder = 'Seleccione…', error, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find((o) => o.value === value)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const btnCls = [
    'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm text-left transition',
    'focus:outline-none focus:ring-2',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    error
      ? 'border-accent-red bg-accent-red/5 focus:ring-accent-red/40'
      : 'border-paper-deep bg-paper focus:ring-pitch/50',
  ].join(' ')

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button type="button" onClick={() => !disabled && setOpen((v) => !v)} disabled={disabled} className={btnCls}>
        <span className="flex items-center gap-2 min-w-0">
          {selected && <OptImg opt={selected} size={20} />}
          <span className={selected ? 'text-ink truncate' : 'text-ink-soft'}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        {/* Chevron */}
        <svg
          className={`flex-shrink-0 h-4 w-4 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Lista desplegable */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-paper-deep bg-paper shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={[
                'flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition',
                value === opt.value
                  ? 'bg-pitch/10 font-semibold text-pitch'
                  : 'text-ink hover:bg-paper-deep',
              ].join(' ')}
            >
              <OptImg opt={opt} size={20} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
