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
  { to: '/cartilla',    label: 'Cartilla'    },
  { to: '/ayuda',       label: 'Ayuda'       },
]

function NavLinks({ onClose }) {
  return links.map((l) => (
    <NavLink
      key={l.to}
      to={l.to}
      end={l.end}
      onClick={onClose}
      className={({ isActive }) =>
        ['rounded-md px-2.5 py-1.5 text-sm font-semibold transition',
          isActive ? 'bg-pitch text-white' : 'text-ink-soft hover:bg-paper-deep hover:text-ink',
        ].join(' ')
      }
    >
      {l.label}
    </NavLink>
  ))
}

export default function NavBar() {
  const { user, logout } = useAuth()
  const [showFanModal, setShowFanModal] = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const favTeam = user?.favoriteTeam ? SELECCION_BY_ID[user.favoriteTeam] : null

  function closeMenu() { setMenuOpen(false) }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-paper-deep bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">

          {/* Marca */}
          <NavLink to="/" onClick={closeMenu} className="flex items-center gap-2 no-underline flex-shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-pitch text-white brand-title text-lg">
              26
            </span>
            <p className="brand-title text-lg text-ink hidden sm:block">WorldCapp</p>
          </NavLink>

          {/* Navegación desktop */}
          <nav className="hidden lg:flex flex-1 items-center gap-0.5 flex-wrap">
            <NavLinks />
          </nav>

          {/* Espaciador móvil */}
          <div className="flex-1 lg:hidden" />

          {/* Usuario desktop */}
          {user && (
            <div className="hidden lg:flex flex-shrink-0 items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-semibold text-ink leading-none">{user.name}</p>
                {favTeam ? (
                  <button
                    type="button"
                    onClick={() => setShowFanModal(true)}
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
                className="rounded-lg border border-paper-deep px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-paper-deep hover:text-ink"
              >
                Salir
              </button>
            </div>
          )}

          {/* Botón hamburguesa móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="lg:hidden rounded-md border border-paper-deep px-2.5 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-paper-deep hover:text-ink"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="lg:hidden border-t border-paper-deep bg-paper px-4 pb-4 pt-3">
            <nav className="flex flex-col gap-1">
              <NavLinks onClose={closeMenu} />
            </nav>

            {user && (
              <div className="mt-3 flex items-center justify-between border-t border-paper-deep pt-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{user.name}</p>
                  {favTeam ? (
                    <button
                      type="button"
                      onClick={() => { setShowFanModal(true); closeMenu() }}
                      className="inline-flex items-center gap-1 text-xs text-accent-gold font-semibold hover:underline"
                    >
                      ⭐ FAN de {favTeam.nickname ?? favTeam.name}
                      <FlagImg iso2={favTeam.iso2} name={favTeam.name} size={14} className="rounded-sm" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setShowFanModal(true); closeMenu() }}
                      className="text-xs text-ink-soft hover:text-pitch hover:underline"
                    >
                      + Elegir equipo FAN
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-paper-deep px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-paper-deep hover:text-ink"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {showFanModal && <FanModal onClose={() => setShowFanModal(false)} />}
    </>
  )
}
