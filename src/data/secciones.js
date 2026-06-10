// SECCION — Catálogo fijo de secciones del álbum Mundial 2026.

import { SELECCIONES } from './selecciones'

// Secciones especiales fijas
const SPECIAL_SECCIONES = [
  { id: 'FWC', name: 'Especiales Mundialistas', order: 0,  type: 'fwc',       accent: '#b8860b' },
  { id: 'CC',  name: 'Coca-Cola Stars',         order: 99, type: 'coca-cola', accent: '#cc0000' },
]

// Una sección por selección
const TEAM_SECCIONES = SELECCIONES.map((s, i) => ({
  id:     s.id,
  name:   s.name,
  order:  i + 1,
  type:   'team',
  accent: s.colors.primary,
  group:  s.group,
}))

export const SECCIONES = [...SPECIAL_SECCIONES, ...TEAM_SECCIONES]

export const SECCION_BY_ID = Object.fromEntries(SECCIONES.map((s) => [s.id, s]))
