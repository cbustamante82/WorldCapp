// useSeedData — Siembra el catálogo fijo del álbum en IndexedDB al arrancar la app.
// Solo se ejecuta una vez (la siembra es idempotente y está versionada en db.js).

import { useEffect, useState } from 'react'
import { seedCatalog } from '../db/db'

export function useSeedData() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    seedCatalog()
      .then(() => active && setReady(true))
      .catch((e) => active && setError(e))
    return () => {
      active = false
    }
  }, [])

  return { ready, error }
}
