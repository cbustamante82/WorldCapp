import { describe, it, expect } from 'vitest'
import { toCSV, fromCSV, parseProgresoCSV } from '../lib/exporters'

describe('toCSV', () => {
  it('retorna string vacío para array vacío', () => {
    expect(toCSV([])).toBe('')
  })

  it('genera encabezado + fila para un registro', () => {
    const result = toCSV([{ a: 1, b: 2 }])
    expect(result).toBe('a,b\n1,2')
  })

  it('escapa valores con coma entre comillas dobles', () => {
    const result = toCSV([{ nombre: 'López, Juan' }])
    expect(result).toContain('"López, Juan"')
  })

  it('escapa comillas internas duplicándolas', () => {
    const result = toCSV([{ texto: 'di "hola"' }])
    expect(result).toContain('"di ""hola"""')
  })

  it('genera múltiples filas correctamente', () => {
    const rows = [{ id: 1, val: 'a' }, { id: 2, val: 'b' }]
    const lines = toCSV(rows).split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('id,val')
    expect(lines[1]).toBe('1,a')
    expect(lines[2]).toBe('2,b')
  })
})

describe('fromCSV', () => {
  it('parsea encabezado y una fila', () => {
    const result = fromCSV('a,b\n1,2')
    expect(result).toEqual([{ a: '1', b: '2' }])
  })

  it('round-trip toCSV → fromCSV', () => {
    const original = [{ id: '10', nombre: 'Messi', estado: 'Pegada' }]
    const csv = toCSV(original)
    const parsed = fromCSV(csv)
    expect(parsed).toEqual(original)
  })
})

describe('parseProgresoCSV', () => {
  const csvValido = 'laminaId,pegada,repetidas\nL001,1,0\nL002,0,2'

  it('parsea CSV válido correctamente', () => {
    const result = parseProgresoCSV(csvValido)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ laminaId: 'L001', pegada: true, repetidas: 0 })
    expect(result[1]).toMatchObject({ laminaId: 'L002', pegada: false, repetidas: 2 })
  })

  it('convierte pegada "1" a true', () => {
    const result = parseProgresoCSV(csvValido)
    expect(result[0].pegada).toBe(true)
  })

  it('convierte pegada "0" a false', () => {
    const result = parseProgresoCSV(csvValido)
    expect(result[1].pegada).toBe(false)
  })

  it('convierte repetidas a número entero', () => {
    const result = parseProgresoCSV(csvValido)
    expect(result[1].repetidas).toBe(2)
  })

  it('lanza error para CSV vacío', () => {
    expect(() => parseProgresoCSV('')).toThrow('vacío')
  })

  it('lanza error si falta la columna laminaId', () => {
    expect(() => parseProgresoCSV('pegada,repetidas\n1,0')).toThrow('Formato inválido')
  })

  it('lanza error si falta la columna pegada', () => {
    expect(() => parseProgresoCSV('laminaId,repetidas\nL001,0')).toThrow('Formato inválido')
  })
})
