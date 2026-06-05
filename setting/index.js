// SwimRank — Settings App (companion app inside Zepp)
// Shows credentials + global rankings for each discipline

// ═══════════════════════════════════════════════════════════════
// I18N
// ═══════════════════════════════════════════════════════════════

const STRINGS = {
  es: {
    tagline:        'Cada pileta es tu arena de competencia',
    rankings_title: '🌐  Rankings Globales',
    account_title:  '⚙️  Cuenta Zepp Health',
    connected:      '✓  Cuenta conectada',
    nickname_label: '🏆 Nickname (aparece en el ranking)',
    nickname_ph:    'ej: JuanNadador',
    email_label:    '📧 Email de Zepp Health',
    email_ph:       'vos@email.com',
    pass_label:     '🔑 Contraseña',
    pass_ph:        '••••••••',
    privacy_title:  '🔒  Privacidad',
    privacy_text:   'Tus credenciales nunca salen de tu teléfono. Solo se usa el token de sesión para importar tus sesiones.',
    clear_btn:      'Borrar credenciales',
    sync_empty:     'Sincronizá desde tu reloj para ver los rankings globales aquí.',
    no_data:        'Sin datos para esta disciplina.',
    top10:          'TOP 10',
    sync_label:     'Sync',
    your_pos:       'Tu posición',
    of:             'de',
    you_tag:        '← TÚ',
    now:            'ahora',
    ago_min:        'hace %d min',
    ago_h:          'hace %dh',
    ago_d:          'hace %dd',
    disc_maxt:      'Tiempo',
    disc_maxd:      'Distancia',
    sync_btn:       '🔄  Actualizar Rankings',
    syncing:        '⏳  Cargando...',
  },
  en: {
    tagline:        'Every pool is your arena',
    rankings_title: '🌐  Global Rankings',
    account_title:  '⚙️  Zepp Health Account',
    connected:      '✓  Account connected',
    nickname_label: '🏆 Nickname (shown in ranking)',
    nickname_ph:    'e.g. SwimmerJohn',
    email_label:    '📧 Zepp Health Email',
    email_ph:       'you@email.com',
    pass_label:     '🔑 Password',
    pass_ph:        '••••••••',
    privacy_title:  '🔒  Privacy',
    privacy_text:   'Your credentials never leave your phone. Only the session token is used to import your sessions.',
    clear_btn:      'Clear credentials',
    sync_empty:     'Sync from your watch to see global rankings here.',
    no_data:        'No data for this discipline.',
    top10:          'TOP 10',
    sync_label:     'Sync',
    your_pos:       'Your position',
    of:             'of',
    you_tag:        '← YOU',
    now:            'now',
    ago_min:        '%d min ago',
    ago_h:          '%dh ago',
    ago_d:          '%dd ago',
    disc_maxt:      'Duration',
    disc_maxd:      'Distance',
    sync_btn:       '🔄  Refresh Rankings',
    syncing:        '⏳  Loading...',
  },
}

// Detect language: Zepp Settings App exposes navigator-like globals
function getLang() {
  try {
    const lang = typeof navigator !== 'undefined' && navigator.language
      ? navigator.language.toLowerCase()
      : 'es'
    return lang.startsWith('en') ? 'en' : 'es'
  } catch (_) {
    return 'es'
  }
}

const LANG = getLang()
function t(key) { return STRINGS[LANG]?.[key] ?? STRINGS.es[key] ?? key }

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS (must be before AppSettingsPage due to no hoisting)
// ═══════════════════════════════════════════════════════════════

const DISC_LIST = [
  { id: '50',   label: '50m'  },
  { id: '100',  label: '100m' },
  { id: '200',  label: '200m' },
  { id: '500',  label: '500m' },
  { id: '1000', label: '1K'   },
  { id: '1500', label: '1.5K' },
  { id: 'maxt', label: t('disc_maxt') },
  { id: 'maxd', label: t('disc_maxd') },
]

function fmtVal(seconds, discId) {
  if (discId === 'maxd') return `${Math.round(seconds)} m`
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(1).padStart(4, '0')
  return m > 0 ? `${m}:${s}` : `${seconds.toFixed(1)}s`
}

function shortId(deviceId) {
  if (!deviceId) return '---'
  return deviceId.slice(-6).toUpperCase()
}

function timeSince(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return t('now')
  if (diff < 3600) return t('ago_min').replace('%d', Math.floor(diff / 60))
  if (diff < 86400) return t('ago_h').replace('%d', Math.floor(diff / 3600))
  return t('ago_d').replace('%d', Math.floor(diff / 86400))
}

function renderSection(title) {
  return View(
    { style: { marginBottom: '14px' } },
    [
      View(
        { style: { fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' } },
        [title]
      ),
    ]
  )
}

function renderDiscPills(selected, settingsStorage) {
  const isSyncing = settingsStorage.getItem('_syncingRankings') === 'true'

  return View(
    {
      style: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '16px',
      }
    },
    [
      ...DISC_LIST.map(d =>
        Button({
          label: d.label,
          style: {
            fontSize: '13px',
            fontWeight: 'bold',
            borderRadius: '16px',
            padding: '6px 14px',
            background: d.id === selected ? '#00BFFF' : '#0A2B44',
            color: d.id === selected ? '#001226' : '#00BFFF',
            border: d.id === selected ? 'none' : '1px solid #0A3B6B',
          },
          onClick: () => {
            settingsStorage.setItem('selectedDisc', d.id)
          },
        })
      ),
      // Sync pill
      Button({
        label: isSyncing ? '⏳' : '🔄',
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          borderRadius: '16px',
          padding: '6px 14px',
          background: '#0A2B44',
          color: '#00BFFF',
          border: '1px solid #0A3B6B',
        },
        onClick: () => {
          settingsStorage.setItem('_syncingRankings', 'true')
          settingsStorage.setItem('_rankingSyncRequest', String(Date.now()))
        },
      }),
    ]
  )
}

function renderLeaderboard(globalData, discId, syncAgo) {
  const discData = globalData?.[discId]
  const top10 = discData?.top10 ?? []
  const myRank = discData?.myRank

  if (!globalData) {
    return View(
      {
        style: {
          background: '#001520',
          borderRadius: '12px',
          padding: '24px 16px',
          textAlign: 'center',
          marginBottom: '8px',
        }
      },
      [
        View({ style: { fontSize: '28px', marginBottom: '8px' } }, ['🏊']),
        View({ style: { color: '#666', fontSize: '14px', lineHeight: '1.5' } },
          [t('sync_empty')]),
      ]
    )
  }

  if (top10.length === 0) {
    return View(
      {
        style: {
          background: '#001520',
          borderRadius: '12px',
          padding: '20px 16px',
          textAlign: 'center',
          marginBottom: '8px',
        }
      },
      [
        View({ style: { color: '#666', fontSize: '14px' } },
          [t('no_data')]),
      ]
    )
  }

  const discMeta = DISC_LIST.find(d => d.id === discId)

  return View({ style: { marginBottom: '8px' } }, [
    // Discipline title bar
    View(
      {
        style: {
          background: '#051D35',
          borderRadius: '12px 12px 0 0',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }
      },
      [
        View({ style: { color: '#00BFFF', fontSize: '16px', fontWeight: 'bold' } },
          [`🏆 ${t('top10')} — ${discMeta?.label ?? discId}`]),
        syncAgo && View({ style: { color: '#444', fontSize: '11px' } }, [`${t('sync_label')}: ${syncAgo}`]),
      ]
    ),

    // Leaderboard rows
    ...top10.map((entry, i) => renderRow(entry, i, discId)),

    // User's global position (if not in top 10)
    myRank && !top10.some(r => r.isYou) && View(
      {
        style: {
          background: '#00243C',
          borderRadius: '0 0 12px 12px',
          padding: '12px 16px',
          borderTop: '1px solid #0A3B6B',
        }
      },
      [
        View(
          { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } },
          [
            View({ style: { color: '#00BFFF', fontSize: '15px', fontWeight: 'bold' } },
              [`${t('your_pos')}: #${myRank.rank} ${t('of')} ${myRank.total}`]),
            View({ style: { color: '#FFFFFF', fontSize: '16px', fontWeight: 'bold' } },
              [fmtVal(myRank.value, discId)]),
          ]
        ),
        myRank.total > 0 && View(
          {
            style: {
              marginTop: '8px',
              background: '#111',
              borderRadius: '4px',
              height: '6px',
              overflow: 'hidden',
            }
          },
          [
            View({
              style: {
                background: '#00BFFF',
                height: '6px',
                width: `${Math.max(2, Math.round((1 - (myRank.rank - 1) / myRank.total) * 100))}%`,
                borderRadius: '4px',
              }
            }, []),
          ]
        ),
      ]
    ),
  ])
}

function renderRow(entry, index, discId) {
  const rank = entry.rank ?? (index + 1)
  const isPodium = rank <= 3
  const isYou = entry.isYou

  const medalColors = { 1: '#FFD700', 2: '#D2DCE6', 3: '#E0945A' }
  const medalBg     = { 1: '#1A1600', 2: '#0F1318', 3: '#1A0E00' }
  const medal       = { 1: '🥇', 2: '🥈', 3: '🥉' }

  const bgColor = isYou ? '#00243C' : isPodium ? medalBg[rank] : (index % 2 === 0 ? '#0A0F18' : '#080D14')

  const nick = entry.nickname && entry.nickname !== 'Anónimo'
    ? entry.nickname
    : shortId(entry.deviceId)

  return View(
    {
      style: {
        background: bgColor,
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderLeft: isYou ? '3px solid #00BFFF' : isPodium ? `3px solid ${medalColors[rank]}` : '3px solid transparent',
      }
    },
    [
      // Rank
      View(
        { style: { width: '36px', textAlign: 'center' } },
        [
          View(
            { style: { fontSize: isPodium ? '18px' : '15px', fontWeight: 'bold', color: isYou ? '#00BFFF' : isPodium ? medalColors[rank] : '#666' } },
            [isPodium ? medal[rank] : `${rank}`]
          ),
        ]
      ),

      // Name
      View(
        { style: { flex: '1', paddingLeft: '8px' } },
        [
          View(
            {
              style: {
                fontSize: '15px',
                fontWeight: isYou || isPodium ? 'bold' : 'normal',
                color: isYou ? '#00BFFF' : '#FFFFFF',
              }
            },
            [isYou ? `${nick}  ${t('you_tag')}` : nick]
          ),
        ]
      ),

      // Value
      View(
        { style: { textAlign: 'right' } },
        [
          View(
            {
              style: {
                fontSize: '15px',
                fontWeight: 'bold',
                color: isYou ? '#00BFFF' : isPodium ? medalColors[rank] : '#999',
              }
            },
            [fmtVal(entry.value, discId)]
          ),
        ]
      ),
    ]
  )
}

AppSettingsPage({
  state: {
    props: {},
  },

  setState(props) {
    this.state.props = props
  },

  build(props) {
    this.setState(props)
    const { settingsStorage } = props

    const nickname = settingsStorage.getItem('nickname') || ''
    const email    = settingsStorage.getItem('zeppEmail') || ''
    const password = settingsStorage.getItem('zeppPassword') || ''
    const isLinked = !!(email && password)

    // Load synced rankings
    const rawGlobal  = settingsStorage.getItem('globalData')
    const globalData = rawGlobal ? JSON.parse(rawGlobal) : null
    const lastSync   = settingsStorage.getItem('lastSyncTime')
    const syncAgo    = lastSync ? timeSince(Number(lastSync)) : null

    // Selected discipline — stored in settingsStorage to trigger re-render on change
    const selDisc = settingsStorage.getItem('selectedDisc') || '100'

    return View(
      { style: { padding: '16px 20px', backgroundColor: '#001226', minHeight: '100%' } },
      [
        // ══════════════════════════════════════════════════════════
        // HEADER
        // ══════════════════════════════════════════════════════════
        View(
          { style: { textAlign: 'center', marginBottom: '24px' } },
          [
            View(
              { style: { fontSize: '26px', fontWeight: 'bold', color: '#00BFFF', marginBottom: '4px' } },
              ['🏊 SwimRank']
            ),
            View(
              { style: { fontSize: '14px', color: '#666' } },
              [t('tagline')]
            ),
          ]
        ),

        // ══════════════════════════════════════════════════════════
        // RANKINGS SECTION
        // ══════════════════════════════════════════════════════════
        renderSection(t('rankings_title')),

        // Discipline selector pills
        renderDiscPills(selDisc, settingsStorage),

        // Leaderboard
        renderLeaderboard(globalData, selDisc, syncAgo),

        // Separator
        View({ style: { height: '1px', background: '#0A3B6B', margin: '24px 0' } }, []),

        // ══════════════════════════════════════════════════════════
        // ACCOUNT SECTION
        // ══════════════════════════════════════════════════════════
        renderSection(t('account_title')),

        // Status banner
        isLinked && View(
          {
            style: {
              background: '#001520',
              border: '1px solid #00CC6640',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
            }
          },
          [
            View({ style: { color: '#00CC66', fontWeight: 'bold', fontSize: '15px' } }, [t('connected')]),
            View({ style: { color: '#555', fontSize: '13px', marginTop: '4px' } }, [email]),
          ]
        ),

        // Nickname
        View(
          { style: { marginBottom: '14px' } },
          [
            View({ style: { color: '#00BFFF', fontSize: '14px', marginBottom: '6px', fontWeight: 'bold' } },
              [t('nickname_label')]),
            TextInput({
              label: '',
              value: nickname,
              placeholder: t('nickname_ph'),
              style: { fontSize: '16px', borderRadius: '10px' },
              onChange: (val) => {
                settingsStorage.setItem('nickname', val.trim())
              },
            }),
          ]
        ),

        // Email
        View(
          { style: { marginBottom: '14px' } },
          [
            View({ style: { color: '#00BFFF', fontSize: '14px', marginBottom: '6px', fontWeight: 'bold' } },
              [t('email_label')]),
            TextInput({
              label: '',
              value: email,
              placeholder: t('email_ph'),
              style: { fontSize: '16px', borderRadius: '10px' },
              onChange: (val) => {
                settingsStorage.setItem('zeppEmail', val.trim())
              },
            }),
          ]
        ),

        // Password
        View(
          { style: { marginBottom: '20px' } },
          [
            View({ style: { color: '#00BFFF', fontSize: '14px', marginBottom: '6px', fontWeight: 'bold' } },
              [t('pass_label')]),
            TextInput({
              label: '',
              value: password,
              placeholder: t('pass_ph'),
              style: { fontSize: '16px', borderRadius: '10px' },
              onChange: (val) => {
                settingsStorage.setItem('zeppPassword', val)
                settingsStorage.removeItem('zeppToken')
                settingsStorage.removeItem('zeppTokenExpiry')
              },
            }),
          ]
        ),

        // Privacy notice
        View(
          {
            style: {
              background: '#001520',
              borderLeft: '3px solid #00BFFF',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
            }
          },
          [
            View({ style: { color: '#00BFFF', fontSize: '14px', fontWeight: 'bold' } }, [t('privacy_title')]),
            View(
              { style: { color: '#555', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' } },
              [t('privacy_text')]
            ),
          ]
        ),

        // Clear button
        isLinked && Button({
          label: t('clear_btn'),
          style: {
            fontSize: '15px',
            borderRadius: '22px',
            background: '#330000',
            color: '#FF6666',
            width: '100%',
          },
          onClick: () => {
            settingsStorage.removeItem('zeppEmail')
            settingsStorage.removeItem('zeppPassword')
            settingsStorage.removeItem('zeppToken')
            settingsStorage.removeItem('zeppTokenExpiry')
          },
        }),

        // Version
        View(
          { style: { textAlign: 'center', marginTop: '24px', color: '#333', fontSize: '12px' } },
          ['SwimRank v1.0.0  ·  Amazfit Active 2']
        ),
      ]
    )
  },
})

