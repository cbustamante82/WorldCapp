// matchApi.js — obtiene resultados desde /api/matches y calcula standings
// Retorna null si la API no está configurada o falla → el caller usa datos estáticos

// Algunos códigos TLA difieren entre football-data.org y nuestro catálogo FIFA
const TLA_MAP = {
  KOR: 'KOR', PRK: 'PRK', IRN: 'IRN', KSA: 'KSA',
  // agrega más si detectas diferencias
}
function normTla(tla = '') {
  const up = tla.toUpperCase()
  return TLA_MAP[up] ?? up
}

// Fetch todos los partidos del WC.
// Retorna { results, hasLive } o null si falla.
export async function fetchMatchData() {
  try {
    const r = await fetch('/api/matches?endpoint=matches', {
      signal: AbortSignal.timeout(9000),
    })
    if (!r.ok) return null
    const data = await r.json()
    if (!Array.isArray(data.matches)) return null

    const results = {}
    let hasLive = false

    for (const m of data.matches) {
      const t1 = normTla(m.homeTeam?.tla)
      const t2 = normTla(m.awayTeam?.tla)
      if (!t1 || !t2) continue

      const isLive = ['IN_PLAY', 'PAUSED', 'HALF_TIME'].includes(m.status)
      const isDone = m.status === 'FINISHED'
      if (isLive) hasLive = true

      // Para partidos en vivo football-data.org actualiza score.halfTime durante el partido;
      // score.fullTime solo se rellena al terminar.
      const scoreObj = isDone ? m.score?.fullTime : (isLive ? (m.score?.halfTime ?? null) : null)

      results[`${t1}-${t2}`] = {
        g1:     scoreObj?.home ?? null,
        g2:     scoreObj?.away ?? null,
        status: m.status,           // SCHEDULED | TIMED | IN_PLAY | PAUSED | HALF_TIME | FINISHED
        minute: m.minute ?? null,
      }
    }

    return { results, hasLive }
  } catch {
    return null
  }
}

// Calcula tabla de posiciones de cada grupo a partir de los resultados.
// groupFixtures: { A: [{team1, team2, ...}], B: ... }
// results: objeto devuelto por fetchMatchData
export function computeStandings(groupFixtures, results) {
  const all = {}

  for (const [g, fixtures] of Object.entries(groupFixtures)) {
    const teams = {}
    for (const f of fixtures) {
      for (const t of [f.team1, f.team2]) {
        if (!teams[t]) {
          teams[t] = { tla: t, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
        }
      }
    }

    for (const f of fixtures) {
      const res = results[`${f.team1}-${f.team2}`]
      if (!res || res.status !== 'FINISHED' || res.g1 === null) continue
      const { g1, g2 } = res
      const a = teams[f.team1]
      const b = teams[f.team2]
      a.played++; b.played++
      a.gf += g1; a.ga += g2; a.gd = a.gf - a.ga
      b.gf += g2; b.ga += g1; b.gd = b.gf - b.ga
      if (g1 > g2)      { a.won++; a.pts += 3; b.lost++ }
      else if (g2 > g1) { b.won++; b.pts += 3; a.lost++ }
      else              { a.draw++; a.pts++; b.draw++; b.pts++ }
    }

    all[g] = Object.values(teams).sort(
      (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.tla.localeCompare(b.tla)
    )
  }

  return all
}
