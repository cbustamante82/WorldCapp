// AuthContext — Sesión de usuario via Supabase Auth.
// user expone: { id, email, name, country, favoriteTeam } — mismo contrato que antes.

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [isRecovering, setIsRecovering] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? normalize(session.user) : null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsRecovering(event === 'PASSWORD_RECOVERY')
      setUser(session ? normalize(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, isRecovering, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

function normalize(supabaseUser) {
  if (!supabaseUser) return null
  const m = supabaseUser.user_metadata ?? {}
  return {
    id:           supabaseUser.id,
    email:        supabaseUser.email,
    name:         m.name         ?? '',
    country:      m.country      ?? '',
    favoriteTeam: m.favoriteTeam ?? '',
  }
}
