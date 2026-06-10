// LoadingContext — Overlay global "Guardando cambios…" para llamadas a Supabase.

import { createContext, useContext, useState, useCallback } from 'react'

const LoadingContext = createContext(null)

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false)

  const withLoading = useCallback(async (fn) => {
    setLoading(true)
    try { await fn() }
    finally { setLoading(false) }
  }, [])

  return (
    <LoadingContext.Provider value={{ withLoading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-xl border border-paper-deep bg-paper px-8 py-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-pitch border-t-transparent" />
              <p className="text-sm font-semibold text-ink">Guardando cambios…</p>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
