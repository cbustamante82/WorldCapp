// HomeView — Portada del álbum. Click navega a la sección de láminas especiales FWC.

import { useNavigate } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../auth/AuthContext'
import { LAMINAS, ALBUM_TOTALS } from '../data/laminas'

export default function HomeView() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { map: estadoMap } = useCollection()

  function goToAlbum() {
    const fanId = user?.favoriteTeam
    navigate(fanId ? `/album?seccion=${fanId}` : '/album')
  }

  const pegadas   = LAMINAS.filter((l) => estadoMap[l.id]?.pegada).length
  const repetidas = LAMINAS.reduce((acc, l) => acc + (estadoMap[l.id]?.repetidas || 0), 0)
  const pct       = Math.round((pegadas / ALBUM_TOTALS.stickers) * 100)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col items-center gap-8">

      {/* Portada del álbum — clickeable */}
      <button
        type="button"
        onClick={() => goToAlbum()}
        title="Ver Álbum"
        className="group relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl transition-transform hover:scale-[1.02] focus:outline-none"
      >
        <img
          src="/portada.jpg"
          alt="FIFA World Cup 2026 – Official Sticker Collection"
          className="w-full object-cover"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="brand-title text-xl text-white drop-shadow">
            Ver Álbum →
          </span>
        </div>
      </button>

      {/* Progreso global */}
      <div className="w-full max-w-md rounded-xl border border-paper-deep bg-paper p-5 shadow-sm">
        <h2 className="brand-title mb-3 text-2xl text-ink">Mi progreso</h2>

        {/* Barra */}
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-pitch transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mb-4 text-right text-sm font-semibold text-pitch">{pct}% completado</p>

        <div className="grid grid-cols-3 gap-3 text-center">
          <StatBox label="Pegadas"   value={pegadas}              color="text-pitch" />
          <StatBox label="Faltantes" value={ALBUM_TOTALS.stickers - pegadas} color="text-accent-red" />
          <StatBox label="Repetidas" value={repetidas}            color="text-accent-gold" />
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        <QuickLink onClick={() => goToAlbum()}   label="📖 Ver álbum"      />
        <QuickLink onClick={() => navigate('/grupos')}  label="🏆 Grupos y partidos" />
        <QuickLink onClick={() => navigate('/secciones')} label="⭐ Especiales"   />
        <QuickLink onClick={() => navigate('/progreso')} label="📊 Mi progreso"   />
      </div>

      <p className="text-center text-[11px] text-ink-soft">
        {ALBUM_TOTALS.stickers} láminas · {ALBUM_TOTALS.teams} selecciones · {ALBUM_TOTALS.specials} especiales
      </p>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="rounded-lg border border-paper-deep bg-paper-deep/40 py-3">
      <p className={`brand-title text-3xl tabular ${color}`}>{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  )
}

function QuickLink({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-paper-deep bg-paper px-4 py-3 text-sm font-semibold text-ink-soft shadow-sm transition hover:bg-paper-deep hover:text-ink"
    >
      {label}
    </button>
  )
}
