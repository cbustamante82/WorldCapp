import { describe, it, expect } from 'vitest'
import { getResumen, getPorSeccion, getPorSeleccion } from '../lib/stats'

// estadoMap helper
function mkMap(entries) {
  return Object.fromEntries(entries)
}

const laminas = [
  { id: 'L1', sectionId: 'SEC-A', seleccionId: 'ARG', tipoId: 'portero' },
  { id: 'L2', sectionId: 'SEC-A', seleccionId: 'ARG', tipoId: 'defensa'  },
  { id: 'L3', sectionId: 'SEC-B', seleccionId: 'BRA', tipoId: 'delantero' },
  { id: 'L4', sectionId: 'SEC-B', seleccionId: 'BRA', tipoId: 'delantero' },
]

describe('getResumen', () => {
  it('devuelve ceros cuando no hay láminas pegadas', () => {
    const map = mkMap([])
    const r = getResumen(laminas, map)
    expect(r.pegadas).toBe(0)
    expect(r.faltantes).toBe(4)
    expect(r.pct).toBe(0)
    expect(r.repetidas).toBe(0)
  })

  it('devuelve 100% cuando todas están pegadas', () => {
    const map = mkMap(laminas.map((l) => [l.id, { pegada: true, repetidas: 0 }]))
    const r = getResumen(laminas, map)
    expect(r.pct).toBe(100)
    expect(r.faltantes).toBe(0)
  })

  it('calcula correctamente al 50%', () => {
    const map = mkMap([
      ['L1', { pegada: true,  repetidas: 0 }],
      ['L2', { pegada: true,  repetidas: 0 }],
    ])
    const r = getResumen(laminas, map)
    expect(r.pct).toBe(50)
    expect(r.pegadas).toBe(2)
  })

  it('suma las repetidas de todas las láminas', () => {
    const map = mkMap([
      ['L1', { pegada: true, repetidas: 3 }],
      ['L3', { pegada: true, repetidas: 2 }],
    ])
    const r = getResumen(laminas, map)
    expect(r.repetidas).toBe(5)
  })

  it('devuelve total correcto', () => {
    const r = getResumen(laminas, {})
    expect(r.total).toBe(4)
  })
})

describe('getPorSeccion', () => {
  it('agrupa correctamente por sección', () => {
    const map = mkMap([
      ['L1', { pegada: true, repetidas: 0 }],
    ])
    const grupos = getPorSeccion(laminas, map)
    const secA = grupos.find((g) => g.key === 'SEC-A')
    expect(secA).toBeDefined()
    expect(secA.total).toBe(2)
    expect(secA.pegadas).toBe(1)
  })
})

describe('getPorSeleccion', () => {
  it('agrupa correctamente por selección', () => {
    const map = mkMap([
      ['L3', { pegada: true, repetidas: 0 }],
      ['L4', { pegada: true, repetidas: 0 }],
    ])
    const grupos = getPorSeleccion(laminas, map)
    const bra = grupos.find((g) => g.key === 'BRA')
    expect(bra).toBeDefined()
    expect(bra.pct).toBe(100)
  })
})
