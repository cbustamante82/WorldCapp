// SELECCION — Catálogo de selecciones del álbum Mundial 2026.
// 48 equipos organizados por grupo, siguiendo la Plantilla Album.pdf.
// `colors` se usa para el fondo de página (gradiente de bandera).
// `group` indica el grupo del Mundial 2026.

export const SELECCIONES = [
  // Grupo A
  { id: 'MEX', emoji: '🇲🇽', iso2: 'mx', name: 'México',             confederation: 'CONCACAF', group: 'A', nickname: 'El Tri', colors: { primary: '#006847', secondary: '#ce1126' } },
  { id: 'RSA', emoji: '🇿🇦', iso2: 'za', name: 'Sudáfrica',          confederation: 'CAF',      group: 'A', nickname: 'Bafana Bafana', colors: { primary: '#007A4D', secondary: '#FFB612' } },
  { id: 'KOR', emoji: '🇰🇷', iso2: 'kr', name: 'Corea del Sur',      confederation: 'AFC',      group: 'A', nickname: 'Los Guerreros Taeguk', colors: { primary: '#C60C30', secondary: '#003478' } },
  { id: 'CZE', emoji: '🇨🇿', iso2: 'cz', name: 'Rep. Checa',         confederation: 'UEFA',     group: 'A', nickname: 'Repre', colors: { primary: '#D7141A', secondary: '#11457E' } },
  // Grupo B
  { id: 'CAN', emoji: '🇨🇦', iso2: 'ca', name: 'Canadá',             confederation: 'CONCACAF', group: 'B', nickname: 'Les Rouges', colors: { primary: '#FF0000', secondary: '#ffffff' } },
  { id: 'BIH', emoji: '🇧🇦', iso2: 'ba', name: 'Bosnia y Herz.',     confederation: 'UEFA',     group: 'B', nickname: 'Zmajevi', colors: { primary: '#002395', secondary: '#FFCD00' } },
  { id: 'QAT', emoji: '🇶🇦', iso2: 'qa', name: 'Qatar',              confederation: 'AFC',      group: 'B', nickname: 'Al-Annabi', colors: { primary: '#8D153A', secondary: '#ffffff' } },
  { id: 'SUI', emoji: '🇨🇭', iso2: 'ch', name: 'Suiza',              confederation: 'UEFA',     group: 'B', nickname: 'Schweizer Nati', colors: { primary: '#FF0000', secondary: '#ffffff' } },
  // Grupo C
  { id: 'BRA', emoji: '🇧🇷', iso2: 'br', name: 'Brasil',             confederation: 'CONMEBOL', group: 'C', nickname: 'Canarinho', colors: { primary: '#009C3B', secondary: '#FFDF00' } },
  { id: 'MAR', emoji: '🇲🇦', iso2: 'ma', name: 'Marruecos',          confederation: 'CAF',      group: 'C', nickname: 'Los Leones del Atlas', colors: { primary: '#C1272D', secondary: '#006233' } },
  { id: 'HAI', emoji: '🇭🇹', iso2: 'ht', name: 'Haití',              confederation: 'CONCACAF', group: 'C', nickname: 'Les Grenadiers', colors: { primary: '#00209F', secondary: '#D21034' } },
  { id: 'SCO', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󁿢', iso2: 'gb-sct', name: 'Escocia',            confederation: 'UEFA',     group: 'C', nickname: 'The Tartan Army', colors: { primary: '#003DA5', secondary: '#ffffff' } },
  // Grupo D
  { id: 'USA', emoji: '🇺🇸', iso2: 'us', name: 'Estados Unidos',     confederation: 'CONCACAF', group: 'D', nickname: 'The Stars and Stripes', colors: { primary: '#3C3B6E', secondary: '#B22234' } },
  { id: 'PAR', emoji: '🇵🇾', iso2: 'py', name: 'Paraguay',           confederation: 'CONMEBOL', group: 'D', nickname: 'La Albirroja', colors: { primary: '#D52B1E', secondary: '#0038A8' } },
  { id: 'AUS', emoji: '🇦🇺', iso2: 'au', name: 'Australia',          confederation: 'AFC',      group: 'D', nickname: 'Socceroos', colors: { primary: '#00008B', secondary: '#FFCC00' } },
  { id: 'TUR', emoji: '🇹🇷', iso2: 'tr', name: 'Türkiye',            confederation: 'UEFA',     group: 'D', nickname: 'Ay-Yıldızlılar', colors: { primary: '#E30A17', secondary: '#ffffff' } },
  // Grupo E
  { id: 'GER', emoji: '🇩🇪', iso2: 'de', name: 'Alemania',           confederation: 'UEFA',     group: 'E', nickname: 'Die Mannschaft', colors: { primary: '#000000', secondary: '#DD0000' } },
  { id: 'CUW', emoji: '🇨🇼', iso2: 'cw', name: 'Curaçao',            confederation: 'CONCACAF', group: 'E', nickname: 'La Onda Azul', colors: { primary: '#00338D', secondary: '#FFD100' } },
  { id: 'CIV', emoji: '🇨🇮', iso2: 'ci', name: 'Costa de Marfil',    confederation: 'CAF',      group: 'E', nickname: 'Los Elefantes', colors: { primary: '#F77F00', secondary: '#009A44' } },
  { id: 'ECU', emoji: '🇪🇨', iso2: 'ec', name: 'Ecuador',            confederation: 'CONMEBOL', group: 'E', nickname: 'La Tri', colors: { primary: '#FFD100', secondary: '#003580' } },
  // Grupo F
  { id: 'NED', emoji: '🇳🇱', iso2: 'nl', name: 'Países Bajos',       confederation: 'UEFA',     group: 'F', nickname: 'Oranje', colors: { primary: '#AE1C28', secondary: '#21468B' } },
  { id: 'JPN', emoji: '🇯🇵', iso2: 'jp', name: 'Japón',              confederation: 'AFC',      group: 'F', nickname: 'Samurai Blue', colors: { primary: '#BC002D', secondary: '#ffffff' } },
  { id: 'SWE', emoji: '🇸🇪', iso2: 'se', name: 'Suecia',             confederation: 'UEFA',     group: 'F', nickname: 'Blågult', colors: { primary: '#006AA7', secondary: '#FECC02' } },
  { id: 'TUN', emoji: '🇹🇳', iso2: 'tn', name: 'Túnez',              confederation: 'CAF',      group: 'F', nickname: 'Las Águilas de Cartago', colors: { primary: '#E70013', secondary: '#ffffff' } },
  // Grupo G
  { id: 'BEL', emoji: '🇧🇪', iso2: 'be', name: 'Bélgica',            confederation: 'UEFA',     group: 'G', nickname: 'Los Diablos Rojos', colors: { primary: '#000000', secondary: '#EF3340' } },
  { id: 'EGY', emoji: '🇪🇬', iso2: 'eg', name: 'Egipto',             confederation: 'CAF',      group: 'G', nickname: 'Los Faraones', colors: { primary: '#CE1126', secondary: '#000000' } },
  { id: 'IRN', emoji: '🇮🇷', iso2: 'ir', name: 'Irán',               confederation: 'AFC',      group: 'G', nickname: 'Team Melli', colors: { primary: '#239F40', secondary: '#DA0000' } },
  { id: 'NZL', emoji: '🇳🇿', iso2: 'nz', name: 'Nueva Zelanda',      confederation: 'OFC',      group: 'G', nickname: 'All Whites', colors: { primary: '#00247D', secondary: '#CC142B' } },
  // Grupo H
  { id: 'ESP', emoji: '🇪🇸', iso2: 'es', name: 'España',             confederation: 'UEFA',     group: 'H', nickname: 'La Furia Roja', colors: { primary: '#AA151B', secondary: '#F1BF00' } },
  { id: 'CPV', emoji: '🇨🇻', iso2: 'cv', name: 'Cabo Verde',         confederation: 'CAF',      group: 'H', nickname: 'Tubarões Azuis', colors: { primary: '#003893', secondary: '#CF2027' } },
  { id: 'KSA', emoji: '🇸🇦', iso2: 'sa', name: 'Arabia Saudita',     confederation: 'AFC',      group: 'H', nickname: 'Los Halcones Verdes', colors: { primary: '#006C35', secondary: '#ffffff' } },
  { id: 'URU', emoji: '🇺🇾', iso2: 'uy', name: 'Uruguay',            confederation: 'CONMEBOL', group: 'H', nickname: 'La Celeste', colors: { primary: '#75AADB', secondary: '#ffffff' } },
  // Grupo I
  { id: 'FRA', emoji: '🇫🇷', iso2: 'fr', name: 'Francia',            confederation: 'UEFA',     group: 'I', nickname: 'Les Bleus', colors: { primary: '#002395', secondary: '#ED2939' } },
  { id: 'SEN', emoji: '🇸🇳', iso2: 'sn', name: 'Senegal',            confederation: 'CAF',      group: 'I', nickname: 'Los Leones de la Teranga', colors: { primary: '#00853F', secondary: '#E31B23' } },
  { id: 'IRQ', emoji: '🇮🇶', iso2: 'iq', name: 'Irak',               confederation: 'AFC',      group: 'I', nickname: 'Los Leones de Mesopotamia', colors: { primary: '#CE1126', secondary: '#007A3D' } },
  { id: 'NOR', emoji: '🇳🇴', iso2: 'no', name: 'Noruega',            confederation: 'UEFA',     group: 'I', nickname: 'Løvene', colors: { primary: '#EF2B2D', secondary: '#002868' } },
  // Grupo J
  { id: 'ARG', emoji: '🇦🇷', iso2: 'ar', name: 'Argentina',          confederation: 'CONMEBOL', group: 'J', nickname: 'La Albiceleste', colors: { primary: '#75AADB', secondary: '#ffffff' } },
  { id: 'ALG', emoji: '🇩🇿', iso2: 'dz', name: 'Argelia',            confederation: 'CAF',      group: 'J', nickname: 'Los Fennecs', colors: { primary: '#006233', secondary: '#D21034' } },
  { id: 'AUT', emoji: '🇦🇹', iso2: 'at', name: 'Austria',            confederation: 'UEFA',     group: 'J', nickname: 'Das Team', colors: { primary: '#ED2939', secondary: '#ffffff' } },
  { id: 'JOR', emoji: '🇯🇴', iso2: 'jo', name: 'Jordania',           confederation: 'AFC',      group: 'J', nickname: 'Al-Nashama', colors: { primary: '#007A3D', secondary: '#CE1126' } },
  // Grupo K
  { id: 'POR', emoji: '🇵🇹', iso2: 'pt', name: 'Portugal',           confederation: 'UEFA',     group: 'K', nickname: 'Seleção das Quinas', colors: { primary: '#006600', secondary: '#FF0000' } },
  { id: 'COD', emoji: '🇨🇩', iso2: 'cd', name: 'Rep. Dem. Congo',    confederation: 'CAF',      group: 'K', nickname: 'Los Leopardos', colors: { primary: '#007FFF', secondary: '#F7D618' } },
  { id: 'UZB', emoji: '🇺🇿', iso2: 'uz', name: 'Uzbekistán',         confederation: 'AFC',      group: 'K', nickname: 'Los Lobos Blancos', colors: { primary: '#1EB53A', secondary: '#0099B5' } },
  { id: 'COL', emoji: '🇨🇴', iso2: 'co', name: 'Colombia',           confederation: 'CONMEBOL', group: 'K', nickname: 'Los Cafeteros', colors: { primary: '#FCD116', secondary: '#003087' } },
  // Grupo L
  { id: 'ENG', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󁿢', iso2: 'gb-eng', name: 'Inglaterra',         confederation: 'UEFA',     group: 'L', nickname: 'Three Lions', colors: { primary: '#CF091F', secondary: '#ffffff' } },
  { id: 'CRO', emoji: '🇭🇷', iso2: 'hr', name: 'Croacia',            confederation: 'UEFA',     group: 'L', nickname: 'Vatreni', colors: { primary: '#FF0000', secondary: '#0000FF' } },
  { id: 'GHA', emoji: '🇬🇭', iso2: 'gh', name: 'Ghana',              confederation: 'CAF',      group: 'L', nickname: 'Black Stars', colors: { primary: '#006B3F', secondary: '#FCD116' } },
  { id: 'PAN', emoji: '🇵🇦', iso2: 'pa', name: 'Panamá',             confederation: 'CONCACAF', group: 'L', nickname: 'Los Canaleros', colors: { primary: '#CE1126', secondary: '#1C3F94' } },
]

export const SELECCION_BY_ID = Object.fromEntries(SELECCIONES.map((s) => [s.id, s]))
