// useIsLandscapeMobile — true cuando el dispositivo está en orientación horizontal
// y el ancho sigue siendo de móvil (< 768px, breakpoint `md`). Usado para aprovechar
// el ancho disponible en landscape sin afectar el layout de tablet/desktop (RNF-015).
import { useState, useEffect } from 'react'

const QUERY = '(orientation: landscape) and (max-width: 767px)'

export function useIsLandscapeMobile() {
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const update = () => setIsLandscapeMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isLandscapeMobile
}
