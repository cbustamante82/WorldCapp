// exporters.js — Exportación e importación de datos del álbum.
// Todo ocurre en el navegador: ningún dato sale a servidores externos.

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Helpers CSV ──────────────────────────────────────────────────────────────
export function toCSV(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
}

export function fromCSV(text) {
  const lines   = text.trim().split(/\r?\n/)
  const headers = lines[0].split(',').map((h) => h.replace(/^﻿/, '').trim())
  return lines.slice(1).map((line) => {
    const vals = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim() ?? '']))
  })
}

// ── Exportación del listado filtrado (uso interno de ProgressView) ───────────
export function exportCSV(rows, filename = 'album-mundial-2026.csv') {
  downloadBlob('﻿' + toCSV(rows), filename, 'text/csv;charset=utf-8;')
}
export function exportJSON(rows, filename = 'album-mundial-2026.json') {
  downloadBlob(JSON.stringify(rows, null, 2), filename, 'application/json')
}

// ── Backup completo del progreso ─────────────────────────────────────────────
// Formato: laminaId, pegada (0|1), repetidas
// Solo incluye láminas con algún estado activo (pegada o repetidas > 0).
export function exportProgresoCSV(laminas, estadoMap) {
  const rows = laminas
    .filter((l) => estadoMap[l.id]?.pegada || (estadoMap[l.id]?.repetidas ?? 0) > 0)
    .map((l) => ({
      laminaId:  l.id,
      pegada:    estadoMap[l.id]?.pegada    ? 1 : 0,
      repetidas: estadoMap[l.id]?.repetidas ?? 0,
    }))

  const date = new Date().toISOString().slice(0, 10)
  downloadBlob('﻿' + toCSV(rows), `progreso-worldcapp-${date}.csv`, 'text/csv;charset=utf-8;')
  return rows.length  // devuelve cuántas láminas se exportaron
}

// ── Exportar láminas faltantes ────────────────────────────────────────────────
// Columnas: numero, nombre, seccion, grupo
// Solo incluye láminas NO pegadas.
export function exportFaltantesCSV(laminas, estadoMap, seleccionById = {}) {
  const SECCION_LABEL = { FWC: 'Especiales Mundialistas', CC: 'Coca-Cola Stars' }

  const rows = laminas
    .filter((l) => !estadoMap[l.id]?.pegada)
    .map((l) => {
      const sel    = seleccionById[l.sectionId]
      const seccion = sel?.name ?? SECCION_LABEL[l.sectionId] ?? l.sectionId
      const grupo   = sel?.group ?? '-'
      return { numero: l.id, nombre: l.name, seccion, grupo }
    })

  const date = new Date().toISOString().slice(0, 10)
  downloadBlob('﻿' + toCSV(rows), `faltantes-worldcapp-${date}.csv`, 'text/csv;charset=utf-8;')
  return rows.length
}

// ── Importar progreso desde CSV ───────────────────────────────────────────────
// Parsea el CSV, valida columnas y devuelve los registros listos para la BD.
export function parseProgresoCSV(text) {
  const rows = fromCSV(text)
  if (!rows.length) throw new Error('El archivo está vacío.')
  if (!('laminaId' in rows[0]) || !('pegada' in rows[0])) {
    throw new Error('Formato inválido: el CSV debe tener columnas laminaId, pegada, repetidas.')
  }
  return rows
    .filter((r) => r.laminaId)
    .map((r) => ({
      laminaId:  r.laminaId,
      pegada:    r.pegada === '1' || r.pegada === 1,
      repetidas: parseInt(r.repetidas, 10) || 0,
      updatedAt: Date.now(),
    }))
}
