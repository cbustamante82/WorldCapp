// CollectionContext — Estado central del progreso del álbum.
// Actualizaciones optimistas: el mapa local se actualiza antes de que responda Supabase.
// Realtime actúa como red de seguridad para sincronización multi-dispositivo.

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

const CollectionContext = createContext(null)

async function fetchAll(userId) {
  const { data } = await supabase
    .from('progreso_usuario')
    .select('lamina_id, pegada, repetidas')
    .eq('user_id', userId)
  const map = {}
  for (const row of data ?? []) {
    map[row.lamina_id] = { pegada: !!row.pegada, repetidas: row.repetidas ?? 0 }
  }
  return map
}

export function CollectionProvider({ children }) {
  const { user } = useAuth()
  const [map, setMap] = useState({})

  // Carga inicial + suscripción Realtime (red de seguridad)
  useEffect(() => {
    if (!user) { setMap({}); return }

    fetchAll(user.id).then(setMap)

    const channel = supabase
      .channel(`progreso:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'progreso_usuario', filter: `user_id=eq.${user.id}` },
        () => fetchAll(user.id).then(setMap),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user?.id])

  const refresh = useCallback(async () => {
    if (user) setMap(await fetchAll(user.id))
  }, [user?.id])

  // ── Mutaciones optimistas (estado local primero, Supabase después) ──────────

  const setPegada = useCallback(async (laminaId, pegada) => {
    if (!user) return
    const prev = map[laminaId] ?? { pegada: false, repetidas: 0 }
    setMap(m => ({ ...m, [laminaId]: { ...prev, pegada } }))
    try {
      await supabase.from('progreso_usuario').upsert({
        user_id: user.id, lamina_id: laminaId, pegada,
        repetidas: prev.repetidas, updated_at: new Date().toISOString(),
      })
    } catch { setMap(m => ({ ...m, [laminaId]: prev })) }
  }, [user?.id, map])

  const addRepetida = useCallback(async (laminaId, delta = 1) => {
    if (!user) return
    const prev = map[laminaId] ?? { pegada: false, repetidas: 0 }
    const repetidas = Math.max(0, (prev.repetidas ?? 0) + delta)
    const newRow = { pegada: prev.pegada || repetidas > 0, repetidas }
    setMap(m => ({ ...m, [laminaId]: newRow }))
    try {
      await supabase.from('progreso_usuario').upsert({
        user_id: user.id, lamina_id: laminaId, ...newRow, updated_at: new Date().toISOString(),
      })
    } catch { setMap(m => ({ ...m, [laminaId]: prev })) }
  }, [user?.id, map])

  const removeLamina = useCallback(async (laminaId) => {
    if (!user) return
    const prev = map[laminaId]
    setMap(m => ({ ...m, [laminaId]: { pegada: false, repetidas: 0 } }))
    try {
      await supabase.from('progreso_usuario').upsert({
        user_id: user.id, lamina_id: laminaId, pegada: false, repetidas: 0,
        updated_at: new Date().toISOString(),
      })
    } catch { if (prev) setMap(m => ({ ...m, [laminaId]: prev })) }
  }, [user?.id, map])

  // ── Operaciones en bloque (actualizan estado + persisten) ────────────────────

  const resetProgreso = useCallback(async () => {
    if (!user) return
    setMap({})
    await supabase.from('progreso_usuario').delete().eq('user_id', user.id)
  }, [user?.id])

  // laminaIds = undefined → limpia todo el álbum; array → solo esas láminas
  const clearRepetidas = useCallback(async (laminaIds) => {
    if (!user) return
    const targets = (laminaIds ?? Object.keys(map)).filter(id => (map[id]?.repetidas ?? 0) > 0)
    if (!targets.length) return

    setMap(m => {
      const next = { ...m }
      for (const id of targets) next[id] = { ...next[id], repetidas: 0 }
      return next
    })
    await supabase.from('progreso_usuario').upsert(
      targets.map(id => ({
        user_id: user.id, lamina_id: id,
        pegada: map[id]?.pegada ?? false,
        repetidas: 0, updated_at: new Date().toISOString(),
      }))
    )
  }, [user?.id, map])

  const resetSeccion = useCallback(async (sectionId, laminas) => {
    if (!user) return
    const ids = laminas.filter(l => l.sectionId === sectionId).map(l => l.id)
    if (!ids.length) return
    setMap(m => {
      const next = { ...m }
      for (const id of ids) delete next[id]
      return next
    })
    await supabase.from('progreso_usuario').delete().eq('user_id', user.id).in('lamina_id', ids)
  }, [user?.id])

  const importProgreso = useCallback(async (records) => {
    if (!user) return
    await supabase.from('progreso_usuario').delete().eq('user_id', user.id)
    if (records.length) {
      await supabase.from('progreso_usuario').insert(
        records.map(r => ({
          user_id: user.id, lamina_id: r.laminaId,
          pegada: !!r.pegada, repetidas: r.repetidas ?? 0,
          updated_at: new Date().toISOString(),
        }))
      )
    }
    const newMap = {}
    for (const r of records) newMap[r.laminaId] = { pegada: !!r.pegada, repetidas: r.repetidas ?? 0 }
    setMap(newMap)
  }, [user?.id])

  return (
    <CollectionContext.Provider value={{
      map, refresh,
      setPegada, addRepetida, removeLamina,
      resetProgreso, clearRepetidas, resetSeccion, importProgreso,
    }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  return useContext(CollectionContext)
}
