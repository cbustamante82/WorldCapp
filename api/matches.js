// Vercel Serverless Function — proxy hacia football-data.org
// Requiere env var: FOOTBALL_DATA_API_KEY (https://www.football-data.org/)
// Competición: WC = FIFA World Cup (código estándar)

export default async function handler(req, res) {
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (!key) {
    return res.status(503).json({ error: 'not_configured' })
  }

  const endpoint = req.query.endpoint === 'standings' ? 'standings' : 'matches'
  const url = `https://api.football-data.org/v4/competitions/WC/${endpoint}`

  try {
    const upstream = await fetch(url, {
      headers: { 'X-Auth-Token': key },
      signal: AbortSignal.timeout(8000),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return res.status(upstream.status).json(data)
    }

    // Cache 60s en CDN de Vercel; el cliente puede servirse del stale hasta 5min
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.json(data)
  } catch (e) {
    return res.status(502).json({ error: e.message })
  }
}
