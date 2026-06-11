// db.js — Operaciones de perfil de usuario via Supabase Auth.
// Las mutaciones de progreso (pegar, repetidas, resetear) las maneja CollectionContext directamente.

import { supabase } from '../lib/supabase'

export async function updateUsuarioFavoriteTeam(favoriteTeam) {
  await supabase.auth.updateUser({ data: { favoriteTeam } })
}
