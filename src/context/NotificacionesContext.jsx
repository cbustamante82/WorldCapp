import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

const NotificacionesContext = createContext({ pendingCount: 0 })

export function NotificacionesProvider({ children }) {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  const fetchCount = useCallback(async () => {
    if (!user) { setPendingCount(0); return }
    const { count } = await supabase
      .from('intercambios')
      .select('*', { count: 'exact', head: true })
      .eq('receptor_id', user.id)
      .eq('estado', 'pendiente')
    setPendingCount(count ?? 0)
  }, [user?.id])

  useEffect(() => {
    fetchCount()
    const ch = supabase
      .channel('notif-intercambios')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'intercambios' },
        fetchCount,
      )
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchCount])

  return (
    <NotificacionesContext.Provider value={{ pendingCount }}>
      {children}
    </NotificacionesContext.Provider>
  )
}

export function useNotificaciones() {
  return useContext(NotificacionesContext)
}
