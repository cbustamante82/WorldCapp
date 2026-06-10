// FIXTURES — Calendario oficial FIFA World Cup 2026.
// Fase de grupos: Jun 11–28. Rondas finales: Jul 1–19.
// result: null = no jugado | { g1, g2 } = marcador final.
// Fuentes: FIFA, ESPN, Sky Sports (dic 2025).

// ─── Fase de grupos ──────────────────────────────────────────────────────────
export const GROUP_FIXTURES = {
  A: [
    { md:1, date:'2026-06-11', team1:'MEX', team2:'RSA', city:'Ciudad de México', venue:'Estadio Azteca',       result: null },
    { md:1, date:'2026-06-11', team1:'KOR', team2:'CZE', city:'Zapopan',          venue:'Estadio Akron',        result: null },
    { md:2, date:'2026-06-18', team1:'MEX', team2:'KOR', city:'Dallas',           venue:'AT&T Stadium',         result: null },
    { md:2, date:'2026-06-18', team1:'CZE', team2:'RSA', city:'Houston',          venue:'NRG Stadium',          result: null },
    { md:3, date:'2026-06-24', team1:'MEX', team2:'CZE', city:'San Francisco',    venue:'Levi\'s Stadium',      result: null },
    { md:3, date:'2026-06-24', team1:'RSA', team2:'KOR', city:'Seattle',          venue:'Lumen Field',          result: null },
  ],
  B: [
    { md:1, date:'2026-06-12', team1:'CAN', team2:'BIH', city:'Toronto',          venue:'BMO Field',            result: null },
    { md:1, date:'2026-06-13', team1:'QAT', team2:'SUI', city:'Santa Clara',      venue:'Levi\'s Stadium',      result: null },
    { md:2, date:'2026-06-18', team1:'SUI', team2:'BIH', city:'Kansas City',      venue:'Arrowhead Stadium',    result: null },
    { md:2, date:'2026-06-19', team1:'QAT', team2:'CAN', city:'Los Ángeles',      venue:'SoFi Stadium',         result: null },
    { md:3, date:'2026-06-25', team1:'CAN', team2:'SUI', city:'Seattle',          venue:'Lumen Field',          result: null },
    { md:3, date:'2026-06-25', team1:'BIH', team2:'QAT', city:'Dallas',           venue:'AT&T Stadium',         result: null },
  ],
  C: [
    { md:1, date:'2026-06-13', team1:'BRA', team2:'MAR', city:'Nueva York/NJ',    venue:'MetLife Stadium',      result: null },
    { md:1, date:'2026-06-13', team1:'HAI', team2:'SCO', city:'Boston',           venue:'Gillette Stadium',     result: null },
    { md:2, date:'2026-06-19', team1:'BRA', team2:'HAI', city:'Atlanta',          venue:'Mercedes-Benz Stadium',result: null },
    { md:2, date:'2026-06-19', team1:'SCO', team2:'MAR', city:'Vancouver',        venue:'BC Place',             result: null },
    { md:3, date:'2026-06-25', team1:'BRA', team2:'SCO', city:'Miami',            venue:'Hard Rock Stadium',    result: null },
    { md:3, date:'2026-06-25', team1:'MAR', team2:'HAI', city:'Filadelfia',       venue:'Lincoln Financial Field',result: null },
  ],
  D: [
    { md:1, date:'2026-06-12', team1:'USA', team2:'PAR', city:'Los Ángeles',      venue:'SoFi Stadium',         result: null },
    { md:1, date:'2026-06-13', team1:'AUS', team2:'TUR', city:'Vancouver',        venue:'BC Place',             result: null },
    { md:2, date:'2026-06-19', team1:'USA', team2:'AUS', city:'Dallas',           venue:'AT&T Stadium',         result: null },
    { md:2, date:'2026-06-19', team1:'TUR', team2:'PAR', city:'Houston',          venue:'NRG Stadium',          result: null },
    { md:3, date:'2026-06-25', team1:'TUR', team2:'USA', city:'San Francisco',    venue:'Levi\'s Stadium',      result: null },
    { md:3, date:'2026-06-25', team1:'PAR', team2:'AUS', city:'Kansas City',      venue:'Arrowhead Stadium',    result: null },
  ],
  E: [
    { md:1, date:'2026-06-14', team1:'GER', team2:'CUW', city:'Houston',          venue:'NRG Stadium',          result: null },
    { md:1, date:'2026-06-14', team1:'CIV', team2:'ECU', city:'Monterrey',        venue:'Estadio BBVA',         result: null },
    { md:2, date:'2026-06-20', team1:'GER', team2:'CIV', city:'Dallas',           venue:'AT&T Stadium',         result: null },
    { md:2, date:'2026-06-20', team1:'CUW', team2:'ECU', city:'Los Ángeles',      venue:'SoFi Stadium',         result: null },
    { md:3, date:'2026-06-26', team1:'GER', team2:'ECU', city:'Atlanta',          venue:'Mercedes-Benz Stadium',result: null },
    { md:3, date:'2026-06-26', team1:'CIV', team2:'CUW', city:'Zapopan',          venue:'Estadio Akron',        result: null },
  ],
  F: [
    { md:1, date:'2026-06-14', team1:'NED', team2:'SWE', city:'Miami',            venue:'Hard Rock Stadium',    result: null },
    { md:1, date:'2026-06-14', team1:'JPN', team2:'TUN', city:'Monterrey',        venue:'Estadio BBVA',         result: null },
    { md:2, date:'2026-06-20', team1:'NED', team2:'JPN', city:'Kansas City',      venue:'Arrowhead Stadium',    result: null },
    { md:2, date:'2026-06-20', team1:'TUN', team2:'SWE', city:'Boston',           venue:'Gillette Stadium',     result: null },
    { md:3, date:'2026-06-26', team1:'NED', team2:'TUN', city:'Dallas',           venue:'AT&T Stadium',         result: null },
    { md:3, date:'2026-06-26', team1:'SWE', team2:'JPN', city:'Houston',          venue:'NRG Stadium',          result: null },
  ],
  G: [
    { md:1, date:'2026-06-15', team1:'BEL', team2:'EGY', city:'Seattle',          venue:'Lumen Field',          result: null },
    { md:1, date:'2026-06-15', team1:'IRN', team2:'NZL', city:'Los Ángeles',      venue:'SoFi Stadium',         result: null },
    { md:2, date:'2026-06-21', team1:'BEL', team2:'IRN', city:'Los Ángeles',      venue:'SoFi Stadium',         result: null },
    { md:2, date:'2026-06-21', team1:'NZL', team2:'EGY', city:'Vancouver',        venue:'BC Place',             result: null },
    { md:3, date:'2026-06-26', team1:'EGY', team2:'IRN', city:'Atlanta',          venue:'Mercedes-Benz Stadium',result: null },
    { md:3, date:'2026-06-26', team1:'NZL', team2:'BEL', city:'Kansas City',      venue:'Arrowhead Stadium',    result: null },
  ],
  H: [
    { md:1, date:'2026-06-15', team1:'ESP', team2:'CPV', city:'Atlanta',          venue:'Mercedes-Benz Stadium',result: null },
    { md:1, date:'2026-06-15', team1:'KSA', team2:'URU', city:'Miami',            venue:'Hard Rock Stadium',    result: null },
    { md:2, date:'2026-06-21', team1:'ESP', team2:'KSA', city:'Atlanta',          venue:'Mercedes-Benz Stadium',result: null },
    { md:2, date:'2026-06-21', team1:'URU', team2:'CPV', city:'Miami',            venue:'Hard Rock Stadium',    result: null },
    { md:3, date:'2026-06-27', team1:'ESP', team2:'URU', city:'Boston',           venue:'Gillette Stadium',     result: null },
    { md:3, date:'2026-06-27', team1:'CPV', team2:'KSA', city:'San Francisco',    venue:'Levi\'s Stadium',      result: null },
  ],
  I: [
    { md:1, date:'2026-06-16', team1:'FRA', team2:'SEN', city:'Nueva York/NJ',    venue:'MetLife Stadium',      result: null },
    { md:1, date:'2026-06-16', team1:'IRQ', team2:'NOR', city:'Boston',           venue:'Gillette Stadium',     result: null },
    { md:2, date:'2026-06-22', team1:'FRA', team2:'IRQ', city:'Filadelfia',       venue:'Lincoln Financial Field',result: null },
    { md:2, date:'2026-06-22', team1:'NOR', team2:'SEN', city:'Nueva York/NJ',    venue:'MetLife Stadium',      result: null },
    { md:3, date:'2026-06-27', team1:'FRA', team2:'NOR', city:'Filadelfia',       venue:'Lincoln Financial Field',result: null },
    { md:3, date:'2026-06-27', team1:'SEN', team2:'IRQ', city:'Kansas City',      venue:'Arrowhead Stadium',    result: null },
  ],
  J: [
    { md:1, date:'2026-06-16', team1:'ARG', team2:'ALG', city:'Kansas City',      venue:'Arrowhead Stadium',    result: null },
    { md:1, date:'2026-06-16', team1:'AUT', team2:'JOR', city:'Santa Clara',      venue:'Levi\'s Stadium',      result: null },
    { md:2, date:'2026-06-22', team1:'ARG', team2:'AUT', city:'Dallas',           venue:'AT&T Stadium',         result: null },
    { md:2, date:'2026-06-22', team1:'JOR', team2:'ALG', city:'Santa Clara',      venue:'Levi\'s Stadium',      result: null },
    { md:3, date:'2026-06-28', team1:'ARG', team2:'JOR', city:'Houston',          venue:'NRG Stadium',          result: null },
    { md:3, date:'2026-06-28', team1:'ALG', team2:'AUT', city:'Dallas',           venue:'AT&T Stadium',         result: null },
  ],
  K: [
    { md:1, date:'2026-06-17', team1:'POR', team2:'COD', city:'Houston',          venue:'NRG Stadium',          result: null },
    { md:1, date:'2026-06-17', team1:'UZB', team2:'COL', city:'Ciudad de México', venue:'Estadio Azteca',       result: null },
    { md:2, date:'2026-06-23', team1:'POR', team2:'UZB', city:'Houston',          venue:'NRG Stadium',          result: null },
    { md:2, date:'2026-06-23', team1:'COL', team2:'COD', city:'Zapopan',          venue:'Estadio Akron',        result: null },
    { md:3, date:'2026-06-28', team1:'POR', team2:'COL', city:'Miami',            venue:'Hard Rock Stadium',    result: null },
    { md:3, date:'2026-06-28', team1:'COD', team2:'UZB', city:'Seattle',          venue:'Lumen Field',          result: null },
  ],
  L: [
    { md:1, date:'2026-06-17', team1:'ENG', team2:'CRO', city:'Dallas',           venue:'AT&T Stadium',         result: null },
    { md:1, date:'2026-06-17', team1:'GHA', team2:'PAN', city:'Toronto',          venue:'BMO Field',            result: null },
    { md:2, date:'2026-06-23', team1:'ENG', team2:'GHA', city:'Boston',           venue:'Gillette Stadium',     result: null },
    { md:2, date:'2026-06-23', team1:'PAN', team2:'CRO', city:'Toronto',          venue:'BMO Field',            result: null },
    { md:3, date:'2026-06-28', team1:'ENG', team2:'PAN', city:'Nueva York/NJ',    venue:'MetLife Stadium',      result: null },
    { md:3, date:'2026-06-28', team1:'CRO', team2:'GHA', city:'Los Ángeles',      venue:'SoFi Stadium',         result: null },
  ],
}

// ─── Rondas finales ──────────────────────────────────────────────────────────
export const KNOCKOUT_ROUNDS = [
  {
    round: 'Ronda de 32',
    dates: '1–4 Jul 2026',
    matches: 16,
    note: '24 clasificados (top 2 de cada grupo) + 8 mejores terceros',
  },
  {
    round: 'Octavos de Final',
    dates: '4–7 Jul 2026',
    matches: 8,
    cities: ['Dallas', 'Atlanta', 'Los Ángeles', 'Nueva York/NJ', 'Houston', 'Boston', 'Seattle', 'Miami'],
  },
  {
    round: 'Cuartos de Final',
    dates: '9–11 Jul 2026',
    matches: 4,
    cities: ['Dallas', 'Atlanta', 'Los Ángeles', 'Nueva York/NJ'],
  },
  {
    round: 'Semifinales',
    dates: '14–15 Jul 2026',
    matches: 2,
    cities: ['Dallas (14 Jul)', 'Atlanta (15 Jul)'],
  },
  {
    round: 'Tercer Puesto',
    dates: '18 Jul 2026',
    matches: 1,
    cities: ['Miami — Hard Rock Stadium'],
  },
  {
    round: 'Final',
    dates: '19 Jul 2026',
    matches: 1,
    cities: ['Nueva York/NJ — MetLife Stadium'],
  },
]
