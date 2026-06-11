// AlbumView — Álbum con efecto flipbook de 2 fases (EXIT + ENTER).
// FASE 1: página actual rota hasta quedar de canto (rotateY 0→-90°, 280ms).
// FASE 2: nueva página se despliega desde el canto (rotateY 90→0°, 320ms).
// Sombra dinámica en el doblez. Bloqueo durante la animación.
// Controles: botones ‹ › | teclado ← → | swipe táctil.

import { useState, useEffect, useCallback, useRef } from 'react'
import LaminaCard from '../components/LaminaCard'
import FlagImg from '../components/FlagImg'
import FlagSelect from '../components/FlagSelect'
import ConfirmDialog from '../components/ConfirmDialog'
import TrashIcon from '../components/TrashIcon'
import { useCollection, getEstado } from '../hooks/useCollection'
import { PAGINAS, LAMINAS, ALBUM_TOTALS } from '../data/laminas'
import { SELECCION_BY_ID } from '../data/selecciones'
import { SECCION_BY_ID } from '../data/secciones'
import { useAuth } from '../auth/AuthContext'
import { useLoading } from '../context/LoadingContext'
import { useSearchParams } from 'react-router-dom'

// ─── Constantes ──────────────────────────────────────────────────────────────
const ALL_PAGES    = PAGINAS                          // 51 páginas en orden
const EXIT_MS      = 280                              // duración fase EXIT
const ENTER_MS     = 320                              // duración fase ENTER

// Opciones del selector de salto rápido (con iso2 para banderas, imgUrl para especiales)
const TWEMOJI = (cp) => `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp}.svg`
const JUMP_OPTIONS = [
  { value: 0,                                                         label: 'Especiales Mundialistas', imgUrl: TWEMOJI('2b50')  },
  ...PAGINAS
    .filter((p) => p.type === 'team')
    .map((p) => {
      const idx = PAGINAS.indexOf(p)
      const s   = SELECCION_BY_ID[p.sectionId]
      return { value: idx, label: `${s?.name} · Grupo ${s?.group}`, iso2: s?.iso2 ?? null }
    }),
  { value: PAGINAS.findIndex((p) => p.id === 'p-fwc-2'), label: 'Campeones Mundiales', imgUrl: TWEMOJI('1f3c6') },
  { value: PAGINAS.findIndex((p) => p.id === 'p-cc'),    label: 'Coca-Cola Stars',     imgUrl: TWEMOJI('1f964') },
]

// ─── Vista principal ─────────────────────────────────────────────────────────
export default function AlbumView() {
  const { map: estadoMap, clearRepetidas, resetSeccion } = useCollection()
  const { user }        = useAuth()
  const { withLoading } = useLoading()
  const [searchParams]   = useSearchParams()

  // ── Máquina de estados del flipbook ──
  // phase: 'idle' | 'exiting' | 'entering'
  // Lazy init: lee ?seccion= directo de la URL para evitar problemas de timing con React state
  const [displayIdx, setDisplayIdx] = useState(() => {
    const sec = new URLSearchParams(window.location.search).get('seccion')
    if (sec) {
      const idx = ALL_PAGES.findIndex((p) => p.sectionId === sec)
      if (idx >= 0) return idx
    }
    return 0
  })
  const [phase,   setPhase]   = useState('idle')
  const [flipDir, setFlipDir] = useState('forward') // 'forward' | 'backward'
  const busy = useRef(false)

  // ── Diálogos de confirmación ──
  const [confirmSec,        setConfirmSec]        = useState(null)  // sectionId a confirmar
  const [confirmClearRepPg, setConfirmClearRepPg] = useState(false) // limpiar repetidas de la página

  // Sincronizar con cambios de ?seccion= MIENTRAS el álbum ya está montado (navegar desde grupos, etc.)
  // No corre en el primer mount porque el lazy init ya fijó el índice correcto.
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    const sec = searchParams.get('seccion')
    if (!sec) return
    const idx = ALL_PAGES.findIndex((p) => p.sectionId === sec)
    if (idx >= 0 && !busy.current) flipTo(idx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // ── Animación de vuelta de hoja ──
  const flipTo = useCallback((targetIdx) => {
    if (busy.current) return
    if (targetIdx < 0 || targetIdx >= ALL_PAGES.length) return
    if (targetIdx === displayIdx) return

    const dir = targetIdx > displayIdx ? 'forward' : 'backward'
    busy.current = true
    setFlipDir(dir)
    setPhase('exiting')                              // FASE 1: página actual se va

    setTimeout(() => {
      setDisplayIdx(targetIdx)
      setPhase('entering')                           // FASE 2: nueva página entra

      setTimeout(() => {
        setPhase('idle')
        busy.current = false
      }, ENTER_MS)
    }, EXIT_MS)
  }, [displayIdx])

  // ── Teclado ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') flipTo(displayIdx + 1)
      if (e.key === 'ArrowLeft')  flipTo(displayIdx - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [displayIdx, flipTo])

  // ── Swipe táctil ──
  const touchX = useRef(null)
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchX.current === null) return
    const dx = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 48) flipTo(displayIdx + (dx > 0 ? 1 : -1))
    touchX.current = null
  }

  // ── Datos de la página visible ──
  const page      = ALL_PAGES[displayIdx]
  const laminas   = LAMINAS.filter((l) => l.pageId === page.id)
  const ordered   = [...laminas].sort((a, b) => a.positionInSheet - b.positionInSheet)
  const pegadas        = ordered.filter((l) => getEstado(estadoMap, l.id).pegada).length
  const pageRepetidas  = ordered.reduce((s, l) => s + (estadoMap[l.id]?.repetidas || 0), 0)
  const totalPeg  = LAMINAS.filter((l) => estadoMap[l.id]?.pegada).length
  const seleccion = SELECCION_BY_ID[page.sectionId]
  const isFanPage = !!user?.favoriteTeam && page.sectionId === user.favoriteTeam

  // Clase CSS para la fase actual
  const pageClass = phase === 'exiting'
    ? `page-exit-${flipDir}`
    : phase === 'entering'
      ? `page-enter-${flipDir}`
      : ''

  const shadowClass = phase === 'exiting'
    ? `flip-shadow-exit-${flipDir}`
    : phase === 'entering'
      ? `flip-shadow-enter-${flipDir}`
      : ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">

      {/* ── Barra de control ──────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <FlagSelect
            options={JUMP_OPTIONS}
            value={displayIdx}
            onChange={(v) => flipTo(v)}
            disabled={phase !== 'idle'}
          />
        </div>

        <span className="text-xs tabular text-ink-soft">
          {displayIdx + 1} / {ALL_PAGES.length}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <FlipBtn
            disabled={phase !== 'idle' || displayIdx === 0}
            onClick={() => flipTo(displayIdx - 1)}
          >
            ‹<span className="hidden md:inline"> Anterior</span>
          </FlipBtn>
          <FlipBtn
            disabled={phase !== 'idle' || displayIdx === ALL_PAGES.length - 1}
            onClick={() => flipTo(displayIdx + 1)}
          >
            <span className="hidden md:inline">Siguiente </span>›
          </FlipBtn>
        </div>
      </div>

      {/* ── Escenario 3D con perspectiva ─────────────────────────────────── */}
      <div
        className="flip-stage relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Página con clase de animación según fase */}
        <div className={`relative overflow-hidden rounded-2xl shadow-2xl ${pageClass} ${isFanPage && phase === 'idle' ? 'fan-page-glow' : ''}`}>

          {/* Contenido de la página */}
          {page.type === 'team' && seleccion && (
            <TeamPage page={page} ordered={ordered} seleccion={seleccion} pegadas={pegadas} estadoMap={estadoMap} isFan={isFanPage} />
          )}
          {page.type === 'fwc' && (
            <SpecialPage page={page} ordered={ordered} pegadas={pegadas} estadoMap={estadoMap} variant="fwc" />
          )}
          {page.type === 'coca-cola' && (
            <SpecialPage page={page} ordered={ordered} pegadas={pegadas} estadoMap={estadoMap} variant="coca-cola" />
          )}

          {/* Sombra de doblez (solo durante la animación) */}
          {phase !== 'idle' && (
            <div
              className={`pointer-events-none absolute inset-0 rounded-2xl ${shadowClass}`}
            />
          )}
        </div>
      </div>

      {/* ── Footer: progreso + acciones ─────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-paper-deep bg-paper px-4 py-3 text-sm">
        <span className="text-ink-soft text-sm">
          Progreso global
          <span className="ml-3 hidden text-[11px] text-ink-soft/60 lg:inline">← → navegar · swipe en móvil</span>
        </span>
        <div className="flex items-center gap-4">
          {/* Botón: limpiar repetidas de la página (solo visible si hay alguna) */}
          {pageRepetidas > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearRepPg(true)}
              className="text-xs font-semibold text-accent-gold/80 transition hover:text-accent-gold"
              title="Poner a 0 las repetidas de esta página"
            >
              <span className="inline-flex items-center gap-1.5">
                <TrashIcon size={15} /> Repetidas ({pageRepetidas})
              </span>
            </button>
          )}

          {/* Botón reset sección */}
          <button
            type="button"
            onClick={() => setConfirmSec(page.sectionId)}
            className="text-xs font-semibold text-accent-red/70 transition hover:text-accent-red"
            title={`Eliminar progreso de esta sección`}
          >
            <span className="inline-flex items-center gap-1.5"><TrashIcon size={15} /> Sección</span>
          </button>
          <span className="brand-title text-xl text-pitch tabular">
            {totalPeg} / {ALBUM_TOTALS.stickers}
          </span>
        </div>
      </div>

      {/* ── Navegación inferior ──────────────────────────────────────────────── */}
      <div className="mt-3 flex justify-between gap-2">
        <FlipBtn
          disabled={phase !== 'idle' || displayIdx === 0}
          onClick={() => flipTo(displayIdx - 1)}
        >
          ‹<span className="hidden md:inline"> Anterior</span>
        </FlipBtn>
        <span className="self-center text-xs tabular text-ink-soft">
          {displayIdx + 1} / {ALL_PAGES.length}
        </span>
        <FlipBtn
          disabled={phase !== 'idle' || displayIdx === ALL_PAGES.length - 1}
          onClick={() => flipTo(displayIdx + 1)}
        >
          <span className="hidden md:inline">Siguiente </span>›
        </FlipBtn>
      </div>

      {/* ── Diálogo: limpiar repetidas de la página ──────────────────────────── */}
      {confirmClearRepPg && (
        <ConfirmDialog
          message={`¿Poner a 0 las ${pageRepetidas} repetida${pageRepetidas !== 1 ? 's' : ''} de esta página? Las láminas pegadas no se modifican.`}
          onConfirm={() =>
            withLoading(async () => {
              await clearRepetidas(ordered.map((l) => l.id))
              setConfirmClearRepPg(false)
            })
          }
          onCancel={() => setConfirmClearRepPg(false)}
        />
      )}

      {/* ── Diálogo confirmación reset sección ───────────────────────────────── */}
      {confirmSec && (
        <ConfirmDialog
          message={`¿Desea eliminar todo el progreso de la sección ${SECCION_BY_ID[confirmSec]?.name ?? confirmSec}?`}
          onConfirm={() =>
            withLoading(async () => {
              await resetSeccion(confirmSec, LAMINAS)
              setConfirmSec(null)
            })
          }
          onCancel={() => setConfirmSec(null)}
        />
      )}
    </div>
  )
}

// ─── Página de selección (estilo Panini) ────────────────────────────────────
function TeamPage({ page, ordered, seleccion, pegadas, estadoMap, isFan }) {
  const { primary, secondary } = seleccion.colors
  return (
    <div className="relative" style={{ minHeight: 'clamp(320px, 60vw, 520px)' }}>

      {/* Capa de fondo al 50% de opacidad — solo el gradiente es transparente,
          el contenido encima permanece a opacidad completa */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(150deg, ${primary} 0%, ${secondary}33 60%, ${primary}cc 100%)`,
          opacity: 0.5,
        }}
      />

      {/* Patrón diagonal (sobre el fondo, también suavizado) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${secondary} 0px, ${secondary} 1px, transparent 1px, transparent 20px)`,
        }}
      />

      {/* Contenido a opacidad completa */}
      <div className="relative p-3 sm:p-6">
        {/* Cabecera */}
        <div className="mb-3 sm:mb-5 flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80"
              style={{ color: secondary === '#ffffff' ? 'rgba(255,255,255,0.7)' : secondary }}
            >
              WE ARE
            </p>
            <h2
              className={`brand-title flex items-center gap-2 text-2xl sm:text-4xl xl:text-5xl leading-none drop-shadow-lg ${isFan ? 'fan-name-glow' : ''}`}
              style={{ color: '#ffffff', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
            >
              <FlagImg iso2={seleccion.iso2} name={seleccion.name} size={32} className="rounded shadow-md flex-shrink-0 sm:w-10 sm:h-10" />
              <span className="truncate">{seleccion.name.toUpperCase()}</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {seleccion.confederation} · Grupo {seleccion.group}
            </p>
          </div>

          {/* FanBadge — oculto en pantallas muy pequeñas */}
          {isFan && (
            <div className="hidden sm:flex flex-1 min-w-0">
              <FanBadge iso2={seleccion.iso2} colors={seleccion.colors} name={seleccion.name} />
            </div>
          )}

          <div
            className="rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 text-center shadow-md flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          >
            <p className="brand-title text-xl sm:text-3xl tabular text-white">{pegadas}/{ordered.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">pegadas</p>
          </div>
        </div>

        {/* Grilla de láminas */}
        <div
          className="grid gap-2.5"
          style={{ gridTemplateColumns: `repeat(${page.gridCols}, minmax(0, 1fr))` }}
        >
          {ordered.map((lamina) => (
            <LaminaCard
              key={lamina.id}
              lamina={lamina}
              estado={getEstado(estadoMap, lamina.id)}
              seleccion={seleccion}
              isFan={isFan}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">FIFA World Cup 2026™</p>
          <p className="text-[10px] text-white/50">Pág. {page.number}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Páginas especiales (FWC / Coca-Cola) ───────────────────────────────────
function SpecialPage({ page, ordered, pegadas, estadoMap, variant }) {
  const isFWC = variant === 'fwc'
  const accentColor = isFWC ? '#fde68a' : '#fca5a5'
  const bgStyle = isFWC
    ? { background: 'linear-gradient(135deg, #2c1a00 0%, #5a3800 40%, #3d2600 100%)' }
    : { background: 'linear-gradient(135deg, #1a0000 0%, #8b0000 50%, #cc0000 100%)' }

  return (
    <div style={bgStyle} className="p-3 sm:p-6">
      <header className="mb-3 sm:mb-5 flex items-center justify-between gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: `${accentColor}99` }}
          >
            {isFWC ? 'ESPECIALES MUNDIALISTAS' : 'COCA-COLA STARS'}
          </p>
          <h2
            className="brand-title text-2xl sm:text-4xl leading-none drop-shadow-lg mt-1"
            style={{ color: accentColor, textShadow: '2px 2px 8px rgba(0,0,0,0.6)' }}
          >
            {isFWC ? '⭐ FWC' : '🥤 Coca-Cola'}
          </h2>
        </div>
        <div
          className="rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 text-center shadow-md flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        >
          <p className="brand-title text-xl sm:text-3xl tabular" style={{ color: accentColor }}>
            {pegadas}/{ordered.length}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">pegadas</p>
        </div>
      </header>

      {/* Grilla de láminas */}
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${page.gridCols ?? 5}, minmax(0, 1fr))` }}
      >
        {ordered.map((lamina) => (
          <LaminaCard
            key={lamina.id}
            lamina={lamina}
            estado={getEstado(estadoMap, lamina.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${accentColor}60` }}>
          FIFA World Cup 2026™
        </p>
        <p className="text-[10px]" style={{ color: `${accentColor}60` }}>Pág. {page.number}</p>
      </div>
    </div>
  )
}


// ─── Badge "SOY FAN" con confeti ─────────────────────────────────────────────
function FanBadge({ iso2, colors, name }) {
  const flagUrl   = iso2 ? `https://flagcdn.com/w20/${iso2}.png` : null
  const P         = colors?.primary   ?? '#1a6b3c'
  const S         = colors?.secondary ?? '#ffffff'
  const isWhiteS  = /^#fff(fff)?$/i.test(S)
  const sText     = isWhiteS ? P : '#ffffff'
  // Primera palabra del nombre, máx 9 chars para el cartel
  const shortName = name ? name.split(' ')[0].slice(0, 9) : (iso2?.toUpperCase() ?? '')

  const CONF = ['#fbbf24','#ef4444','#60a5fa','#34d399','#f472b6','#fb923c']
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.round((i / 17) * 256) + 2}px`,
    dur:  `${(1.1 + (i % 6) * 0.22).toFixed(2)}s`,
    del:  `${(i * 0.11).toFixed(2)}s`,
    w: 3 + i % 4, h: 2 + i % 3,
    col: CONF[i % 6],
    rot: (i * 43) % 180,
  }))

  // ── Dibuja una silueta de hincha de frente ──
  function fan(cx, hy, sc, type) {
    const r   = 4.2 * sc            // radio cabeza X
    const ry  = 4.8 * sc            // radio cabeza Y
    const sw  = 5.5 * sc            // hombro
    const hw  = 7.5 * sc            // cadera
    const bh  = 20  * sc            // alto cuerpo
    const ty  = hy + ry             // inicio torso
    const str = 3.8 * sc            // grosor brazos
    const lax = cx - sw - 7 * sc   // punta brazo izq
    const rax = cx + sw + 7 * sc   // punta brazo der
    const ayt = ty - 14 * sc       // altura a la que llegan los brazos
    const sw2 = 16 * sc            // semiancho cartel
    const sh1 = 13 * sc            // alto cartel línea única
    const sh2 = 17 * sc            // alto cartel doble línea
    const del = `${(cx * 0.009 % 0.6).toFixed(2)}s`

    return (
      <g key={`${cx}-${hy}`}
         style={{ animation:'crowd-bounce 0.6s ease-in-out infinite', animationDelay: del }}>
        {/* Cabeza */}
        <ellipse cx={cx} cy={hy} rx={r} ry={ry} fill={P}/>
        {/* Cuerpo */}
        <path d={`M${cx-sw},${ty} Q${cx-hw},${ty+bh*0.4} ${cx-hw},${ty+bh}
                  L${cx+hw},${ty+bh} Q${cx+hw},${ty+bh*0.4} ${cx+sw},${ty} Z`} fill={P}/>

        {/* ── Brazos arriba (festejo) ── */}
        {type === 'cheer' && <>
          <path d={`M${cx-sw},${ty+2} Q${lax+3},${ty-6*sc} ${lax},${ayt}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
          <path d={`M${cx+sw},${ty+2} Q${rax-3},${ty-6*sc} ${rax},${ayt}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
        </>}

        {/* ── Cartel GOOOOL ── */}
        {type === 'sign1' && <>
          <path d={`M${cx-sw},${ty+2} L${cx-sw2+3},${ayt+sh1}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
          <path d={`M${cx+sw},${ty+2} L${cx+sw2-3},${ayt+sh1}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
          <rect x={cx-sw2} y={ayt} width={sw2*2} height={sh1} rx={2} fill="#fbbf24"/>
          <text x={cx} y={ayt+sh1*0.7} textAnchor="middle"
                fontSize={6*sc} fill="#1a1200" fontWeight="bold" fontFamily="Arial,sans-serif">
            GOOOOL
          </text>
        </>}

        {/* ── Cartel Vamos [nombre]! ── */}
        {type === 'sign2' && <>
          <path d={`M${cx-sw},${ty+2} L${cx-sw2+3},${ayt+sh2}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
          <path d={`M${cx+sw},${ty+2} L${cx+sw2-3},${ayt+sh2}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
          <rect x={cx-sw2} y={ayt} width={sw2*2} height={sh2} rx={2} fill={S}/>
          <text x={cx} y={ayt+sh2*0.37} textAnchor="middle"
                fontSize={5.2*sc} fill={sText} fontWeight="bold" fontFamily="Arial,sans-serif">
            Vamos
          </text>
          <text x={cx} y={ayt+sh2*0.76} textAnchor="middle"
                fontSize={5*sc} fill={sText} fontWeight="bold" fontFamily="Arial,sans-serif">
            {shortName}!
          </text>
        </>}

        {/* ── Bandera en un palo ── */}
        {type === 'flag' && <>
          <path d={`M${cx-sw},${ty+2} Q${lax+3},${ty-6*sc} ${lax},${ayt}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
          <path d={`M${cx+sw},${ty+2} Q${rax-3},${ty-6*sc} ${rax},${ayt}`}
                fill="none" stroke={P} strokeWidth={str} strokeLinecap="round"/>
          {/* Asta */}
          <line x1={rax} y1={ayt} x2={rax} y2={ayt-14*sc}
                stroke={P} strokeWidth={1.8} strokeLinecap="round"/>
          {/* Bandera */}
          {flagUrl && (
            <image href={flagUrl}
                   x={rax} y={ayt-14*sc-10*sc}
                   width={18*sc} height={12*sc}
                   preserveAspectRatio="xMidYMid slice"/>
          )}
        </>}
      </g>
    )
  }

  // Fila del fondo: más pequeña y semitransparente
  const BACK  = [[22,50,0.68,'cheer'],[60,48,0.72,'sign1'],[96,46,0.73,'cheer'],
                 [130,45,0.73,'sign2'],[166,46,0.73,'cheer'],[202,48,0.72,'flag'],
                 [238,50,0.68,'cheer']]
  // Fila delantera: más grande y opaca
  const FRONT = [[6,62,0.90,'cheer'],[48,58,1.00,'sign1'],[92,55,1.06,'cheer'],
                 [130,53,1.10,'flag'],[170,55,1.06,'sign2'],[214,58,1.00,'cheer'],
                 [254,62,0.90,'flag']]

  return (
    <div style={{ position:'relative', flex:1, display:'flex', justifyContent:'center',
                  alignItems:'flex-end', paddingTop:22, minWidth:0 }}>
      {/* Confeti */}
      {pieces.map((c, i) => (
        <div key={i} className="confetti-piece"
          style={{ left:c.left, width:c.w, height:c.h, background:c.col,
                   transform:`rotate(${c.rot}deg)`,
                   animationDuration:c.dur, animationDelay:c.del }}/>
      ))}
      {/* Multitud SVG — fondo transparente */}
      <svg viewBox="0 0 260 80"
           style={{ display:'block', width:'100%', overflow:'visible' }}>
        <g opacity="0.40">{BACK.map( ([cx,hy,sc,t]) => fan(cx,hy,sc,t))}</g>
        {FRONT.map(([cx,hy,sc,t]) => fan(cx,hy,sc,t))}
      </svg>
    </div>
  )
}


// ─── Botón de navegación flipbook ─────────────────────────────────────────────
function FlipBtn({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-paper-deep bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-sm transition hover:bg-paper-deep hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}
