// TIPO_LAMINA — Catálogo fijo de tipos de lámina del álbum.

export const TIPOS_LAMINA = [
  { id: 'escudo',         label: 'Escudo',         color: 'var(--color-accent-gold)' },
  { id: 'portero',        label: 'Portero',         color: 'var(--color-accent-blue)' },
  { id: 'defensa',        label: 'Defensa',         color: 'var(--color-pitch)' },
  { id: 'mediocampista',  label: 'Mediocampista',   color: 'var(--color-ink-soft)' },
  { id: 'delantero',      label: 'Delantero',       color: 'var(--color-accent-red)' },
  { id: 'equipo',         label: 'Equipo',          color: 'var(--color-accent-pink)' },
  { id: 'fwc',            label: 'Especial',        color: '#b8860b' },
  { id: 'coca-cola',      label: 'Coca-Cola',       color: '#cc0000' },
]

export const TIPO_BY_ID = Object.fromEntries(TIPOS_LAMINA.map((t) => [t.id, t]))
