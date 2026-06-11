// stats.js — Selectores derivados que cruzan el catálogo fijo con el progreso personal.
// Funciones puras: reciben las láminas y el mapa de estados; no tocan la base.

import { getEstado } from '../hooks/useCollection'
import { SECCION_BY_ID } from '../data/secciones'
import { SELECCION_BY_ID } from '../data/selecciones'
import { TIPO_BY_ID } from '../data/tiposLamina'

// Resumen global: pegadas, faltantes y total de repetidas.
export function getResumen(laminas, estadoMap) {
  let pegadas = 0
  let repetidas = 0
  for (const l of laminas) {
    const e = getEstado(estadoMap, l.id)
    if (e.pegada) pegadas++
    repetidas += e.repetidas
  }
  const total = laminas.length
  const faltantes = total - pegadas
  const pct = total ? Math.round((pegadas / total) * 100) : 0
  return { total, pegadas, faltantes, repetidas, pct }
}

// Agrupa por una clave del catálogo (sectionId | seleccionId | tipoId) y cuenta avance.
function groupBy(laminas, estadoMap, keyField, labelResolver) {
  const groups = new Map()
  for (const l of laminas) {
    const key = l[keyField]
    if (!groups.has(key)) {
      groups.set(key, { key, label: labelResolver(key), total: 0, pegadas: 0, repetidas: 0 })
    }
    const g = groups.get(key)
    g.total++
    const e = getEstado(estadoMap, l.id)
    if (e.pegada) g.pegadas++
    g.repetidas += e.repetidas
  }
  return [...groups.values()].map((g) => ({
    ...g,
    faltantes: g.total - g.pegadas,
    pct: g.total ? Math.round((g.pegadas / g.total) * 100) : 0,
  }))
}

export function getPorSeccion(laminas, estadoMap) {
  return groupBy(laminas, estadoMap, 'sectionId', (id) => SECCION_BY_ID[id]?.name || id)
}

export function getPorSeleccion(laminas, estadoMap) {
  return groupBy(laminas, estadoMap, 'seleccionId', (id) => SELECCION_BY_ID[id]?.name || id)
}

// Lista plana de láminas con su estado, lista para filtrar/exportar.
export function getListado(laminas, estadoMap) {
  return laminas.map((l) => {
    const e = getEstado(estadoMap, l.id)
    return {
      number: l.number,
      name: l.name,
      seccion: SECCION_BY_ID[l.sectionId]?.name || l.sectionId,
      seleccion: SELECCION_BY_ID[l.seleccionId]?.name || l.seleccionId,
      tipo: TIPO_BY_ID[l.tipoId]?.label || l.tipoId,
      estado: e.pegada ? 'Pegada' : 'Faltante',
      repetidas: e.repetidas,
    }
  })
}
