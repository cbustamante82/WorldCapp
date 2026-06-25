// matchApi.js — obtiene resultados del Mundial y calcula standings.
// Flujo: /api/matches (Vercel) → ESPN directo (fallback local dev)

const ESPN_DIRECT = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'

// Mismas excepciones que en api/matches.js (ESPN → código FIFA)
const ESPN_TO_FIFA = {
  'BOS': 'BIH', 'IRI': 'IRN', 'DRC': 'COD',
  'CUR': 'CUW', 'CVE': 'CPV', 'HOL': 'NED', 'NET': 'NED',
}
const norm = (t = '') => { const u = t.toUpperCase(); return ESPN_TO_FIFA[u] ?? u }

// Convierte el array data.matches (formato normalizado del proxy Vercel) en { results, hasLive }
function parseNormalized(matches) {
  const results = {}
  let hasLive = false

  for (const m of matches) {
    const t1 = norm(m.homeTeam?.tla)
    const t2 = norm(m.awayTeam?.tla)
    if (!t1 || !t2) continue

    const isLive = ['IN_PLAY', 'PAUSED', 'HALF_TIME'].includes(m.status)
    const isDone = m.status === 'FINISHED'
    if (isLive) hasLive = true

    const scoreObj = isDone ? m.score?.fullTime : (isLive ? (m.score?.halfTime ?? null) : null)
    const g1 = scoreObj?.home ?? null
    const g2 = scoreObj?.away ?? null
    const status = m.status
    const minute = m.minute ?? null
    // Se guarda en ambos órdenes porque el local/visitante de la API no siempre
    // coincide con el orden team1/team2 de nuestro catálogo estático (fixtures.js).
    results[`${t1}-${t2}`] = { g1, g2, status, minute }
    results[`${t2}-${t1}`] = { g1: g2, g2: g1, status, minute }
  }
  return { results, hasLive }
}

// Convierte eventos ESPN (formato crudo) en { results, hasLive }
function parseESPNEvents(events) {
  const results = {}
  let hasLive = false

  for (const ev of events) {
    const comp  = ev.competitions?.[0]
    const home  = comp?.competitors?.find(c => c.homeAway === 'home')
    const away  = comp?.competitors?.find(c => c.homeAway === 'away')
    if (!home || !away) continue

    const state  = ev.status?.type?.state ?? 'pre'
    const done   = ev.status?.type?.completed ?? false
    const isLive = state === 'in'
    const isDone = state === 'post' && done
    if (isLive) hasLive = true

    const t1 = norm(home.team?.abbreviation)
    const t2 = norm(away.team?.abbreviation)
    if (!t1 || !t2) continue

    const h = parseInt(home.score ?? '0', 10)
    const a = parseInt(away.score ?? '0', 10)
    const g1 = isDone || isLive ? h : null
    const g2 = isDone || isLive ? a : null
    const status = isLive ? 'IN_PLAY' : (isDone ? 'FINISHED' : 'SCHEDULED')
    const minute = isLive ? (ev.status?.displayClock ?? null) : null

    // Se guarda en ambos órdenes porque el local/visitante de ESPN no siempre
    // coincide con el orden team1/team2 de nuestro catálogo estático (fixtures.js).
    results[`${t1}-${t2}`] = { g1, g2, status, minute }
    results[`${t2}-${t1}`] = { g1: g2, g2: g1, status, minute }
  }
  return { results, hasLive }
}

// Exportación principal — intenta proxy Vercel, cae en ESPN directo si falla
export async function fetchMatchData() {
  // 1. Proxy Vercel (producción)
  try {
    const r = await fetch('/api/matches', { signal: AbortSignal.timeout(6000) })
    if (r.ok) {
      const data = await r.json()
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        return parseNormalized(data.matches)
      }
    }
  } catch { /* continúa al fallback */ }

  // 2. ESPN directo desde el browser (dev local / Vercel sin función)
  try {
    const r = await fetch(
      `${ESPN_DIRECT}?dates=20260611-20260719&limit=300`,
      { signal: AbortSignal.timeout(9000) }
    )
    if (!r.ok) return null
    const data = await r.json()
    return parseESPNEvents(data.events ?? [])
  } catch {
    return null
  }
}

// Calcula tabla de posiciones de cada grupo a partir de los resultados.
export function computeStandings(groupFixtures, results) {
  const all = {}

  for (const [g, fixtures] of Object.entries(groupFixtures)) {
    const teams = {}
    for (const f of fixtures)
      for (const t of [f.team1, f.team2])
        if (!teams[t]) teams[t] = { tla: t, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }

    for (const f of fixtures) {
      const res = results[`${f.team1}-${f.team2}`]
      if (!res || res.status !== 'FINISHED' || res.g1 === null) continue
      const { g1, g2 } = res
      const a = teams[f.team1], b = teams[f.team2]
      a.played++; b.played++
      a.gf += g1; a.ga += g2; a.gd = a.gf - a.ga
      b.gf += g2; b.ga += g1; b.gd = b.gf - b.ga
      if      (g1 > g2) { a.won++; a.pts += 3; b.lost++ }
      else if (g2 > g1) { b.won++; b.pts += 3; a.lost++ }
      else              { a.draw++; a.pts++; b.draw++; b.pts++ }
    }

    all[g] = Object.values(teams).sort(
      (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.tla.localeCompare(b.tla)
    )
  }
  return all
}
