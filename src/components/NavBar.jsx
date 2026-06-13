import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useNotificaciones } from '../context/NotificacionesContext'
import { SELECCION_BY_ID } from '../data/selecciones'
import { whatsappInviteUrl } from '../lib/share'
import FlagImg from './FlagImg'
import FanModal from './FanModal'

const links = [
  { to: '/',            label: 'Inicio',     end: true },
  { to: '/album',       label: 'Álbum'       },
  { to: '/secciones',   label: 'Especiales'  },
  { to: '/grupos',      label: 'Grupos'      },
  { to: '/progreso',    label: 'Progreso'    },
  { to: '/exploracion', label: 'Explorar'    },
  { to: '/cartilla',      label: 'Cartilla'      },
  { to: '/intercambios', label: 'Intercambios' },
  { to: '/ayuda',        label: 'Ayuda'         },
]

function NavLinks({ onClose }) {
  const { pendingCount } = useNotificaciones()
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
      <span className="relative inline-flex items-center gap-1.5">
        {l.label}
        {l.to === '/intercambios' && pendingCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white leading-none">
            {pendingCount}
          </span>
        )}
      </span>
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
              <a
                href={whatsappInviteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                title="Invitar por WhatsApp"
                className="flex items-center justify-center rounded-lg px-2.5 py-1.5 text-white transition hover:opacity-80"
                style={{ background: '#25D366' }}
              >
                <WhatsAppIcon size={16} />
              </a>
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
              <div className="mt-3 border-t border-paper-deep pt-3 space-y-3">
                <div className="flex items-center justify-between">
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
                <a
                  href={whatsappInviteUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <WhatsAppIcon size={18} />
                  Invitar amigos por WhatsApp
                </a>
              </div>
            )}
          </div>
        )}
      </header>

      {showFanModal && <FanModal onClose={() => setShowFanModal(false)} />}
    </>
  )
}

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
