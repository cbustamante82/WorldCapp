// Vercel Serverless Function — proxy de resultados del Mundial 2026
// Fuente primaria: ESPN API pública (sin clave, gratis)
// Fuente alternativa: football-data.org (si FOOTBALL_DATA_API_KEY está configurada)

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'

// Algunos códigos de equipo difieren entre ESPN y nuestro catálogo
const ESPN_TLA = {
  'SKN': 'SKN', 'ANG': 'ANG', 'ZIM': 'ZIM',
  'GRN': 'GRN', 'SLV': 'SLV', 'HAI': 'HAI',
  'HON': 'HON', 'JAM': 'JAM', 'TRI': 'TRI',
  'RSA': 'RSA', 'EGY': 'EGY', 'CMR': 'CMR',
  'SEN': 'SEN', 'TUN': 'TUN', 'GHA': 'GHA',
  'NGA': 'NGA', 'CIV': 'CIV', 'MLI': 'MLI',
}
const normTla = (t = '') => ESPN_TLA[t.toUpperCase()] ?? t.toUpperCase()

function mapStatus(state, completed) {
  if (state === 'in')   return 'IN_PLAY'
  if (state === 'post') return completed ? 'FINISHED' : 'FINISHED'
  return 'SCHEDULED'
}

function parseESPNEvents(events = []) {
  return events.map(ev => {
    const comp  = ev.competitions?.[0]
    const home  = comp?.competitors?.find(c => c.homeAway === 'home')
    const away  = comp?.competitors?.find(c => c.homeAway === 'away')
    if (!home || !away) return null

    const state     = ev.status?.type?.state ?? 'pre'
    const completed = ev.status?.type?.completed ?? false
    const status    = mapStatus(state, completed)
    const isDone    = status === 'FINISHED'
    const isLive    = status === 'IN_PLAY'
    const hScore    = parseInt(home.score ?? '0', 10)
    const aScore    = parseInt(away.score ?? '0', 10)

    return {
      homeTeam: { tla: normTla(home.team?.abbreviation) },
      awayTeam: { tla: normTla(away.team?.abbreviation) },
      status,
      minute: isLive ? (ev.status?.displayClock ?? null) : null,
      score: {
        fullTime: isDone ? { home: hScore, away: aScore } : { home: null, away: null },
        halfTime: isLive ? { home: hScore, away: aScore } : { home: null, away: null },
      },
    }
  }).filter(Boolean)
}

// Obtiene resultados de ESPN para un rango de fechas del Mundial
async function fetchESPN() {
  // Pide todos los partidos desde el inicio del Mundial (11 jun) al cierre (19 jul)
  // ESPN soporta ?dates=YYYYMMDD-YYYYMMDD con limit alto
  const url = `${ESPN_BASE}?dates=20260611-20260719&limit=300`
  const r   = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (!r.ok) return null
  const data = await r.json()
  return { matches: parseESPNEvents(data.events ?? []) }
}

export default async function handler(req, res) {
  // ── Intentar ESPN primero (sin clave necesaria) ───────────────────────────
  try {
    const data = await fetchESPN()
    if (data?.matches?.length) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res.json(data)
    }
  } catch (e) {
    console.error('[ESPN]', e.message)
  }

  // ── Fallback: football-data.org si hay clave configurada ─────────────────
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (key) {
    const endpoint = req.query.endpoint === 'standings' ? 'standings' : 'matches'
    const url = `https://api.football-data.org/v4/competitions/WC/${endpoint}`
    try {
      const upstream = await fetch(url, {
        headers: { 'X-Auth-Token': key },
        signal: AbortSignal.timeout(8000),
      })
      const data = await upstream.json()
      if (upstream.ok) {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
        return res.json(data)
      }
    } catch (e) {
      console.error('[FD]', e.message)
    }
  }

  return res.status(502).json({ error: 'no_source_available' })
}
