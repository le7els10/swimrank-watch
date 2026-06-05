// SwimRank — Design tokens (Zepp OS hex integers)
export const SCREEN_W = 466
export const SCREEN_H = 466
export const SAFE_X   = 50   // horizontal inset for circle safe zone
export const SAFE_W   = 366  // usable width = 466 - 50*2

export const C = {
  bg:          0x000000,  // AMOLED black
  navy900:     0x001F3F,
  navy800:     0x052C53,
  navy700:     0x0A3B6B,  // card bg
  card:        0x0A2B44,  // slightly lighter for visibility
  cardPress:   0x1A3B5A,
  pool:        0x0E7BC4,
  cyan:        0x00BFFF,  // primary accent
  cyanBright:  0x5FD7FF,
  gold:        0xFFD700,
  goldBright:  0xFFE873,
  goldDeep:    0xC99A06,
  silver:      0xD2DCE6,
  silverDeep:  0x8A98A8,
  bronze:      0xE0945A,
  bronzeDeep:  0x9C5A2C,
  white:       0xFFFFFF,
  ink90:       0xEBEBEB,  // rgba(255,255,255,.92) approx
  ink60:       0x999999,  // rgba(255,255,255,.60) approx
  ink40:       0x666666,  // rgba(255,255,255,.40) approx
  line:        0x1A1A1A,  // rgba(255,255,255,.10) approx
}

// Medal color by rank
export function rankColor(rank) {
  if (rank === 1) return C.gold
  if (rank === 2) return C.silver
  if (rank === 3) return C.bronze
  return C.ink40
}

// labelKey maps to i18n keys in page/i18n/*.po
export const DISCIPLINES = [
  { id: '50',   labelKey: 'disc_50',   short: '50',   best: '0:31.4', iconChar: '⚡' },
  { id: '100',  labelKey: 'disc_100',  short: '100',  best: '1:08.3', iconChar: '〜' },
  { id: '200',  labelKey: 'disc_200',  short: '200',  best: '2:34.1', iconChar: '〜' },
  { id: '500',  labelKey: 'disc_500',  short: '500',  best: '6:48.0', iconChar: '◎' },
  { id: '1000', labelKey: 'disc_1000', short: '1K',   best: '14:22',  iconChar: '◎' },
  { id: '1500', labelKey: 'disc_1500', short: '1.5K', best: '22:09',  iconChar: '⏱' },
  { id: 'maxt', labelKey: 'disc_maxt', short: 'MAX T', best: '48:12', iconChar: '⏱' },
  { id: 'maxd', labelKey: 'disc_maxd', short: 'MAX D', best: '2400m', iconChar: '→' },
]

export const DISCIPLINE_MAP = Object.fromEntries(DISCIPLINES.map(d => [d.id, d]))
// Legacy: keep label for any place that still uses disc.label directly
DISCIPLINES.forEach(d => { d.label = d.labelKey })

export const BOARDS = {
  '100':  ['1:08.3','1:08.9','1:09.4','1:10.1','1:10.8','1:11.6','1:12.0','1:13.2','1:14.5','1:16.0'],
  '50':   ['0:31.4','0:31.8','0:32.1','0:32.6','0:33.0','0:33.5','0:34.0','0:34.7','0:35.3','0:36.1'],
  '200':  ['2:34.1','2:35.8','2:37.0','2:39.2','2:41.5','2:43.0','2:45.6','2:48.1','2:51.0','2:55.4'],
  '500':  ['6:48.0','6:52.3','6:57.1','7:03.4','7:10.0','7:18.6','7:25.0','7:33.2','7:44.5','7:58.0'],
  '1000': ['14:22','14:31','14:40','14:55','15:10','15:28','15:44','16:02','16:30','17:05'],
  '1500': ['22:09','22:24','22:48','23:10','23:40','24:05','24:38','25:10','25:55','26:48'],
  'maxt': ['48:12','46:30','45:05','43:20','41:50','40:10','38:00','35:25','32:40','28:15'],
  'maxd': ['2400m','2300m','2200m','2050m','1900m','1800m','1650m','1500m','1300m','1100m'],
}

export const WORLD = {
  rank: 47, total: 1203, percentile: 'Top 4%',
  top3: [
    { tag: 'NX-7741', value: '0:58.2', country: 'AUS' },
    { tag: 'QZ-1180', value: '0:59.0', country: 'USA' },
    { tag: 'MK-4402', value: '1:00.4', country: 'JPN' },
  ],
  context: [
    { rank: 45, tag: 'VP-2290', value: '1:07.6', you: false },
    { rank: 46, tag: 'LR-8814', value: '1:08.0', you: false },
    { rank: 47, tag: 'VOS · ID 7F2A', value: '1:08.3', you: true  },
    { rank: 48, tag: 'DH-3351', value: '1:08.7', you: false },
    { rank: 49, tag: 'BC-9007', value: '1:09.1', you: false },
  ],
}

export const API_BASE = 'https://swimrank-api-production.up.railway.app'
