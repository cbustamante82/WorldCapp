import { useState } from 'react'

const SECTIONS = [
  {
    id: 'album',
    icon: '📖',
    title: 'Álbum',
    summary: 'Navega página por página y registra tus láminas',
    steps: [
      { icon: '👆', text: 'Toca una lámina vacía para marcarla como pegada. El fondo cambia al color del equipo.' },
      { icon: '🔁', text: 'Toca nuevamente una lámina pegada para sumar una repetida. Aparece el contador dorado (×2, ×3…).' },
      { icon: '➖', text: 'Presiona el signo − dentro del contador dorado para restar una repetida.' },
      { icon: '✕', text: 'Pasa el cursor (o mantén presionado en móvil) sobre una lámina pegada y toca ✕ para despegarla.' },
      { icon: '⬅️', text: 'Usa los botones Anterior / Siguiente o desliza horizontalmente para pasar de página.' },
      { icon: '⌨️', text: 'En escritorio puedes usar las teclas ← → del teclado para navegar.' },
      { icon: '🔍', text: 'Usa el selector desplegable para saltar directamente a cualquier selección o sección especial.' },
    ],
  },
  {
    id: 'especiales',
    icon: '⭐',
    title: 'Especiales',
    summary: 'Láminas FWC mundialistas y estrellas Coca-Cola',
    steps: [
      { icon: '🏆', text: 'La sección FWC incluye láminas conmemorativas: copa, mascota, emblemas de las sedes y campeones históricos.' },
      { icon: '🥤', text: 'Coca-Cola Stars contiene 14 figuras destacadas del fútbol mundial patrocinadas por Coca-Cola.' },
      { icon: '👆', text: 'La interacción es igual que en el álbum: toca para pegar, toca de nuevo para sumar repetida.' },
    ],
  },
  {
    id: 'grupos',
    icon: '🏟',
    title: 'Grupos y Partidos',
    summary: 'Posiciones, calendario y rondas finales del Mundial 2026',
    steps: [
      { icon: '📊', text: 'Pestaña "Grupos & Progreso": ve los 12 grupos con el avance de láminas pegadas de cada selección.' },
      { icon: '👆', text: 'Toca cualquier equipo para ir directamente a su página en el álbum.' },
      { icon: '📅', text: 'Pestaña "Calendario": todos los partidos de la fase de grupos organizados por fecha.' },
      { icon: '🥇', text: 'Pestaña "Rondas Finales": estructura de la fase eliminatoria (octavos, cuartos, semis y final).' },
    ],
  },
  {
    id: 'progreso',
    icon: '📊',
    title: 'Progreso',
    summary: 'Estadísticas, gráficos y exportación de datos',
    steps: [
      { icon: '📈', text: 'Visualiza tu avance global con el donut de porcentaje completado y las barras por selección y sección.' },
      { icon: '🔍', text: 'Filtra el listado por estado (pegada/faltante), selección o nombre para encontrar láminas rápidamente.' },
      { icon: '📥', text: 'Exporta CSV para compartir tu lista de faltantes con otros coleccionistas.' },
      { icon: '💾', text: 'Usa "Backup progreso (CSV)" para guardar una copia de seguridad de todo tu avance.' },
      { icon: '📤', text: 'Carga un CSV de backup para restaurar tu progreso en otro dispositivo.' },
      { icon: '🗑️', text: 'Las acciones destructivas (eliminar repetidas o resetear el álbum) piden confirmación antes de ejecutarse.' },
    ],
  },
  {
    id: 'explorar',
    icon: '🔭',
    title: 'Explorar',
    summary: 'Ranking de figuras y filtros por tipo de lámina',
    steps: [
      { icon: '🌟', text: 'El ranking muestra las figuras más relevantes de los últimos 4 años según múltiples fuentes deportivas.' },
      { icon: '🎯', text: 'Filtra por tipo de lámina (escudo, portero, delantero…) o por país para encontrar láminas específicas.' },
      { icon: '🟢', text: 'Cada figura del ranking muestra si ya la tienes pegada (verde) o si aún es faltante (rojo).' },
    ],
  },
  {
    id: 'cartilla',
    icon: '📋',
    title: 'Cartilla',
    summary: 'Vista completa del álbum en una sola pantalla',
    steps: [
      { icon: '👁️', text: 'La cartilla muestra todas las páginas del álbum de un vistazo. Cada recuadro es una lámina.' },
      { icon: '🎨', text: 'Recuadro relleno = pegada (color del equipo). Recuadro solo con borde = faltante.' },
      { icon: '🔵', text: 'Las láminas que marques desde la cartilla aparecen en azul durante esa sesión, confirmando que las acabas de agregar.' },
      { icon: '👆', text: 'Toca un recuadro faltante para marcarlo como pegado. Toca el recuadro azul nuevamente para desmarcarlo.' },
      { icon: '🔗', text: 'Toca el nombre de la sección para ir directamente a esa página en el álbum.' },
    ],
  },
  {
    id: 'cuenta',
    icon: '👤',
    title: 'Mi Cuenta',
    summary: 'Registro, acceso y recuperación de contraseña',
    steps: [
      { icon: '📝', text: 'Al registrarte elige una pregunta secreta y su respuesta. Será necesaria si olvidas tu contraseña.' },
      { icon: '🔑', text: 'Para recuperar tu contraseña ve a "¿Olvidaste tu contraseña?" e ingresa tu email. Responde la pregunta secreta y recibirás un enlace por correo.' },
      { icon: '⭐', text: 'Elige tu equipo FAN desde la barra superior. La página de ese equipo tendrá un efecto especial en el álbum.' },
      { icon: '☁️', text: 'Tu progreso se guarda en la nube automáticamente. Puedes acceder desde cualquier dispositivo con tu cuenta.' },
    ],
  },
]

function Section({ section }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-paper-deep bg-paper shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-paper-deep/40"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <div>
            <p className="font-bold text-ink">{section.title}</p>
            <p className="text-xs text-ink-soft">{section.summary}</p>
          </div>
        </div>
        <span className={['text-ink-soft transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}>
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-paper-deep px-4 pb-4 pt-3">
          <ul className="space-y-3">
            {section.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-lg leading-none">{step.icon}</span>
                <p className="text-sm text-ink-soft leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function HelpView() {
  const [allOpen, setAllOpen] = useState(false)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="brand-title text-4xl text-ink">Ayuda</h1>
          <p className="mt-1 text-sm text-ink-soft">Guía completa de uso de WorldCapp</p>
        </div>
        <button
          type="button"
          onClick={() => setAllOpen((o) => !o)}
          className="rounded-lg border border-paper-deep px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-paper-deep hover:text-ink"
        >
          {allOpen ? 'Colapsar todo' : 'Expandir todo'}
        </button>
      </div>

      {/* Tip rápido */}
      <div className="mb-6 rounded-xl border border-pitch/30 bg-pitch/5 px-4 py-3">
        <p className="text-sm font-semibold text-pitch">💡 Consejo rápido</p>
        <p className="mt-1 text-sm text-ink-soft">
          Tu progreso se guarda automáticamente en la nube cada vez que marcas o despegas una lámina.
          No necesitas guardar manualmente.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <ControlledSection key={s.id} section={s} forceOpen={allOpen} />
        ))}
      </div>
    </div>
  )
}

function ControlledSection({ section, forceOpen }) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = forceOpen || localOpen

  return (
    <div className="overflow-hidden rounded-xl border border-paper-deep bg-paper shadow-sm">
      <button
        type="button"
        onClick={() => setLocalOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-paper-deep/40"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{section.icon}</span>
          <div>
            <p className="font-bold text-ink">{section.title}</p>
            <p className="text-xs text-ink-soft">{section.summary}</p>
          </div>
        </div>
        <span className={['flex-shrink-0 text-ink-soft transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}>
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-paper-deep px-4 pb-4 pt-3">
          <ul className="space-y-3">
            {section.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-lg leading-none">{step.icon}</span>
                <p className="text-sm text-ink-soft leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
