export { useCollection } from '../context/CollectionContext'

export function getEstado(map, laminaId) {
  return map[laminaId] ?? { pegada: false, repetidas: 0 }
}
