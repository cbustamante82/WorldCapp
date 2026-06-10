// FanModal — Modal para cambiar la selección favorita del usuario.

import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useLoading } from '../context/LoadingContext'
import { updateUsuarioFavoriteTeam } from '../db/db'
import { SELECCIONES } from '../data/selecciones'
import FlagSelect from './FlagSelect'

const TEAM_OPTIONS = SELECCIONES.map((s) => ({ value: s.id, label: s.name, iso2: s.iso2 }))

export default function FanModal({ onClose }) {
  const { user }        = useAuth()
  const { withLoading } = useLoading()
  const [selected, setSelected] = useState(user?.favoriteTeam ?? '')

  async function handleSave() {
    if (!selected || selected === user?.favoriteTeam) { onClose(); return }
    await withLoading(async () => {
      await updateUsuarioFavoriteTeam(selected)
      // AuthContext se actualiza automáticamente via onAuthStateChange
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xs rounded-2xl border border-paper-deep bg-paper p-6 shadow-2xl">
        <h2 className="brand-title mb-1 text-xl text-ink">Cambiar selección FAN</h2>
        <p className="mb-4 text-xs text-ink-soft">Elige el equipo del que eres hincha</p>

        <FlagSelect
          options={TEAM_OPTIONS}
          value={selected}
          onChange={setSelected}
          placeholder="Seleccione selección…"
        />

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!selected}
            className="flex-1 rounded-xl bg-pitch py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-paper-deep py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-paper-deep"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
