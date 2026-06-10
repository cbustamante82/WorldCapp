// FlagImg — Imagen de bandera real vía flagcdn.com (cdn gratuito, sin API key).
// flagcdn.com solo acepta estos anchos: 20 | 40 | 80 | 160 | 320 | 640 | 1280
// Uso:
//   <FlagImg iso2="mx" name="México" size={32} />   → inline junto al nombre
//   <FlagImg iso2="ar" name="Argentina" watermark /> → fondo transparente en LaminaCard

// Tamaños válidos de flagcdn.com — snapeamos siempre al más cercano hacia arriba
const CDN_SIZES = [20, 40, 80, 160, 320, 640, 1280]
function snapCdn(px) {
  return CDN_SIZES.find((s) => s >= px) ?? 160
}

export default function FlagImg({ iso2, name = '', size = 32, watermark = false, className = '' }) {
  if (!iso2) return null

  if (watermark) {
    const w   = 160
    const w2x = 320
    return (
      <img
        src={`https://flagcdn.com/w${w}/${iso2}.png`}
        srcSet={`https://flagcdn.com/w${w2x}/${iso2}.png 2x`}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.22 }}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }

  // Inline: snapeamos al tamaño CDN válido
  const w   = snapCdn(size)
  const w2x = snapCdn(size * 2)
  // Relación 3:2 (ancho:alto) estándar de banderas
  const displayH = Math.round(size * 2 / 3)

  return (
    <img
      src={`https://flagcdn.com/w${w}/${iso2}.png`}
      srcSet={`https://flagcdn.com/w${w2x}/${iso2}.png 2x`}
      alt={name}
      className={`inline-block flex-shrink-0 rounded-[2px] object-cover shadow-sm ${className}`}
      style={{ width: size, height: displayH, minWidth: size }}
      loading="eager"
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}
