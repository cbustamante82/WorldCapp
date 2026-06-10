// NavBar — Cabecera con navegación y sesión del usuario.

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { SELECCION_BY_ID } from '../data/selecciones'
import FlagImg from './FlagImg'
import FanModal from './FanModal'

const links = [
  { to: '/',            label: 'Inicio',     end: true },
  { to: '/album',       label: 'Álbum'       },
  { to: '/secciones',   label: 'Especiales'  },
  { to: '/grupos',      label: 'Grupos'      },
  { to: '/progreso',    label: 'Progreso'    },
  { to: '/exploracion', label: 'Explorar'    },
]

export default function NavBar() {
  const { user, logout } = useAuth()
  const [showFanModal, setShowFanModal] = useState(false)
  const favTeam = user?.favoriteTeam ? SELECCION_BY_ID[user.favoriteTeam] : null

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-paper-deep bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
          {/* Marca */}
          <NavLink to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-pitch text-white brand-title text-lg">
              26
            </span>
            <p className="brand-title text-lg text-ink hidden sm:block">WorldCapp</p>
          </NavLink>

          {/* Navegación */}
          <nav className="flex flex-1 items-center gap-0.5 flex-wrap">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  ['rounded-md px-2 py-1.5 text-xs font-semibold transition',
                    isActive ? 'bg-pitch text-white' : 'text-ink-soft hover:bg-paper-deep hover:text-ink',
                  ].join(' ')
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Usuario */}
          {user && (
            <div className="flex flex-shrink-0 items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-ink leading-none">{user.name}</p>
                {favTeam ? (
                  <button
                    type="button"
                    onClick={() => setShowFanModal(true)}
                    title="Cambiar selección FAN"
                    className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-accent-gold font-semibold leading-none hover:underline"
                  >
                    ⭐ FAN de {favTeam.nickname ?? favTeam.name}
                    <FlagImg iso2={favTeam.iso2} name={favTeam.name} size={14} className="rounded-sm" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFanModal(true)}
                    className="mt-0.5 text-[10px] text-ink-soft hover:text-pitch hover:underline leading-none"
                  >
                    + Elegir equipo FAN
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                className="rounded-lg border border-paper-deep px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-paper-deep hover:text-ink"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      {showFanModal && <FanModal onClose={() => setShowFanModal(false)} />}
    </>
  )
}
