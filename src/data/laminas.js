// PAGINA + LAMINA — Distribución física completa del álbum Mundial 2026.
// Generado según la Plantilla Album.pdf.
// 44 selecciones × 20 láminas + FWC1-19 + CC1-14 = 913 láminas totales.

const TEAM_ORDER = [
  // Grupo A
  'MEX','RSA','KOR','CZE',
  // Grupo B
  'CAN','BIH','QAT','SUI',
  // Grupo C
  'BRA','MAR','HAI','SCO',
  // Grupo D
  'USA','PAR','AUS','TUR',
  // Grupo E
  'GER','CUW','CIV','ECU',
  // Grupo F
  'NED','JPN','SWE','TUN',
  // Grupo G
  'BEL','EGY','IRN','NZL',
  // Grupo H
  'ESP','CPV','KSA','URU',
  // Grupo I
  'FRA','SEN','IRQ','NOR',
  // Grupo J
  'ARG','ALG','AUT','JOR',
  // Grupo K
  'POR','COD','UZB','COL',
  // Grupo L
  'ENG','CRO','GHA','PAN',
]

const POS_NAME = [
  null,
  'Escudo',
  'Portero 1','Portero 2',
  'Defensa 1','Defensa 2','Defensa 3','Defensa 4','Defensa 5','Defensa 6',
  'Mediocampista 1','Mediocampista 2','Mediocampista 3',
  'Equipo',
  'Mediocampista 4','Mediocampista 5',
  'Delantero 1','Delantero 2','Delantero 3','Delantero 4','Delantero 5',
]
const POS_TYPE = [
  null,
  'escudo',
  'portero','portero',
  'defensa','defensa','defensa','defensa','defensa','defensa',
  'mediocampista','mediocampista','mediocampista',
  'equipo',
  'mediocampista','mediocampista',
  'delantero','delantero','delantero','delantero','delantero',
]

const FWC_PAGE1 = [
  { num: 'FWC0',  name: 'Escudo / Holograma',   pos: 1 },
  { num: 'FWC1',  name: 'Copa del Mundo (1)',    pos: 2 },
  { num: 'FWC2',  name: 'Copa del Mundo (2)',    pos: 3 },
  { num: 'FWC3',  name: 'Mascota Oficial',       pos: 4 },
  { num: 'FWC4',  name: 'Eslogan Oficial',       pos: 5 },
  { num: 'FWC5',  name: 'Balón Oficial',         pos: 6 },
  { num: 'FWC6',  name: 'Emblema Canadá',        pos: 7 },
  { num: 'FWC7',  name: 'Emblema México',        pos: 8 },
  { num: 'FWC8',  name: 'Emblema EE.UU.',        pos: 9 },
]

const FWC_PAGE2 = [
  { num: 'FWC9',  name: 'Italia 1934',           pos: 1  },
  { num: 'FWC10', name: 'Uruguay 1950',          pos: 2  },
  { num: 'FWC11', name: 'Alemania 1954',         pos: 3  },
  { num: 'FWC12', name: 'Brasil 1962',           pos: 4  },
  { num: 'FWC13', name: 'Alemania 1974',         pos: 5  },
  { num: 'FWC14', name: 'Argentina 1986',        pos: 6  },
  { num: 'FWC15', name: 'Brasil 1994',           pos: 7  },
  { num: 'FWC16', name: 'Brasil 2002',           pos: 8  },
  { num: 'FWC17', name: 'Italia 2006',           pos: 9  },
  { num: 'FWC18', name: 'Alemania 2014',         pos: 10 },
  { num: 'FWC19', name: 'Argentina 2022',        pos: 11 },
]

const CC_PLAYERS = [
  'Lamine Yamal',      // CC1
  'Joshua Kimmich',    // CC2
  'Harry Kane',        // CC3
  'Santiago Giménez',  // CC4
  'Joško Gvardiol',    // CC5
  'Federico Valverde', // CC6
  'Jefferson Lerma',   // CC7
  'Enner Valencia',    // CC8
  'Gabriel Magalhães', // CC9
  'Virgil van Dijk',   // CC10
  'Alphonso Davies',   // CC11
  'Emiliano Martínez', // CC12
  'Raúl Jiménez',      // CC13
  'Lautaro Martínez',  // CC14
]

export const PAGINAS = [
  { id: 'p-fwc-1', title: 'Especiales Mundialistas', number: 1,  sectionId: 'FWC', gridCols: 4, type: 'fwc' },
  ...TEAM_ORDER.map((code, i) => ({
    id:        `p-${code}`,
    title:     code,
    number:    i + 2,
    sectionId: code,
    gridCols:  5,
    type:      'team',
  })),
  { id: 'p-fwc-2', title: 'Campeones Mundiales',     number: 46, sectionId: 'FWC', gridCols: 4, type: 'fwc' },
  { id: 'p-cc',    title: 'Coca-Cola Stars',          number: 47, sectionId: 'CC',  gridCols: 7, type: 'coca-cola' },
]

const fwcLaminas1 = FWC_PAGE1.map(({ num, name, pos }) => ({
  id: num, number: num, name,
  pageId: 'p-fwc-1', sectionId: 'FWC', seleccionId: null,
  tipoId: 'fwc', positionInSheet: pos,
}))

const teamLaminas = TEAM_ORDER.flatMap((code) =>
  Array.from({ length: 20 }, (_, i) => {
    const pos = i + 1
    return {
      id: `${code}${pos}`, number: `${code}${pos}`, name: POS_NAME[pos],
      pageId: `p-${code}`, sectionId: code, seleccionId: code,
      tipoId: POS_TYPE[pos], positionInSheet: pos,
    }
  })
)

const fwcLaminas2 = FWC_PAGE2.map(({ num, name, pos }) => ({
  id: num, number: num, name,
  pageId: 'p-fwc-2', sectionId: 'FWC', seleccionId: null,
  tipoId: 'fwc', positionInSheet: pos,
}))

const ccLaminas = CC_PLAYERS.map((name, i) => ({
  id: `CC${i + 1}`, number: `CC${i + 1}`, name,
  pageId: 'p-cc', sectionId: 'CC', seleccionId: null,
  tipoId: 'coca-cola', positionInSheet: i + 1,
}))

export const LAMINAS = [...fwcLaminas1, ...teamLaminas, ...fwcLaminas2, ...ccLaminas]

export const ALBUM_TOTALS = {
  stickers: LAMINAS.length,
  pages:    PAGINAS.length,
  specials: FWC_PAGE1.length + FWC_PAGE2.length + CC_PLAYERS.length,
  teams:    TEAM_ORDER.length,
}

export const LAMINA_BY_ID = Object.fromEntries(LAMINAS.map((l) => [l.id, l]))
