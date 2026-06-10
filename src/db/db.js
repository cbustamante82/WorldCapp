// db.js — Operaciones de progreso del usuario via Supabase (PostgreSQL).
// El catálogo del álbum (láminas, secciones, etc.) vive en los archivos JS de /data.

import { supabase } from '../lib/supabase'

// ── Progreso por usuario ─────────────────────────────────────────────────────

export async function setPegadaUsuario(userId, laminaId, pegada) {
  const prev = await _getRow(userId, laminaId)
  await supabase.from('progreso_usuario').upsert({
    user_id:    userId,
    lamina_id:  laminaId,
    pegada,
    repetidas:  prev?.repetidas ?? 0,
    updated_at: new Date().toISOString(),
  })
}

export async function addRepetidaUsuario(userId, laminaId, delta = 1) {
  const prev     = await _getRow(userId, laminaId)
  const repetidas = Math.max(0, (prev?.repetidas ?? 0) + delta)
  await supabase.from('progreso_usuario').upsert({
    user_id:    userId,
    lamina_id:  laminaId,
    pegada:     prev?.pegada ?? (repetidas > 0),
    repetidas,
    updated_at: new Date().toISOString(),
  })
}

export async function removeLaminaUsuario(userId, laminaId) {
  await supabase.from('progreso_usuario').upsert({
    user_id:    userId,
    lamina_id:  laminaId,
    pegada:     false,
    repetidas:  0,
    updated_at: new Date().toISOString(),
  })
}

export async function resetProgresoUsuario(userId) {
  await supabase.from('progreso_usuario').delete().eq('user_id', userId)
}

export async function clearRepetidasAlbum(userId) {
  const { data } = await supabase
    .from('progreso_usuario')
    .select('lamina_id, repetidas')
    .eq('user_id', userId)
    .gt('repetidas', 0)
  if (!data?.length) return 0
  const updates = data.map((r) => ({
    user_id:    userId,
    lamina_id:  r.lamina_id,
    repetidas:  0,
    updated_at: new Date().toISOString(),
  }))
  await supabase.from('progreso_usuario').upsert(updates)
  return updates.length
}

export async function clearRepetidasPagina(userId, laminaIds) {
  const { data } = await supabase
    .from('progreso_usuario')
    .select('lamina_id, pegada, repetidas')
    .eq('user_id', userId)
    .in('lamina_id', laminaIds)
    .gt('repetidas', 0)
  if (!data?.length) return 0
  const updates = data.map((r) => ({
    user_id:    userId,
    lamina_id:  r.lamina_id,
    pegada:     r.pegada,
    repetidas:  0,
    updated_at: new Date().toISOString(),
  }))
  await supabase.from('progreso_usuario').upsert(updates)
  return updates.length
}

export async function resetSeccionUsuario(userId, sectionId, laminas) {
  const ids = laminas.filter((l) => l.sectionId === sectionId).map((l) => l.id)
  if (!ids.length) return
  await supabase
    .from('progreso_usuario')
    .delete()
    .eq('user_id', userId)
    .in('lamina_id', ids)
}

export async function importProgresoUsuario(userId, records) {
  await supabase.from('progreso_usuario').delete().eq('user_id', userId)
  if (!records.length) return
  const rows = records.map((r) => ({
    user_id:    userId,
    lamina_id:  r.laminaId,
    pegada:     !!r.pegada,
    repetidas:  r.repetidas ?? 0,
    updated_at: new Date().toISOString(),
  }))
  await supabase.from('progreso_usuario').insert(rows)
}

// ── Perfil de usuario ────────────────────────────────────────────────────────

export async function updateUsuarioFavoriteTeam(favoriteTeam) {
  await supabase.auth.updateUser({ data: { favoriteTeam } })
}

// ── Helper interno ───────────────────────────────────────────────────────────

async function _getRow(userId, laminaId) {
  const { data } = await supabase
    .from('progreso_usuario')
    .select('pegada, repetidas')
    .eq('user_id', userId)
    .eq('lamina_id', laminaId)
    .single()
  return data
}
