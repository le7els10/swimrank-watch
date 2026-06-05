// SwimRank — Settings App (companion app inside Zepp)
// Uses the correct Zepp OS Settings App API: global View(), TextInput(), Button()

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

    return View(
      { style: { padding: '16px 20px', backgroundColor: '#001226', minHeight: '100%' } },
      [
        // ── Header ────────────────────────────────────────────────
        View(
          { style: { textAlign: 'center', marginBottom: '20px' } },
          [
            View(
              { style: { fontSize: '22px', fontWeight: 'bold', color: '#00BFFF', marginBottom: '4px' } },
              ['🏊 SwimRank']
            ),
            View(
              { style: { fontSize: '13px', color: '#666' } },
              ['Cada pileta es tu arena de competencia']
            ),
          ]
        ),

        // ── Status banner ─────────────────────────────────────────
        isLinked && View(
          {
            style: {
              background: '#001520',
              border: '1px solid #00CC6640',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
            }
          },
          [
            View({ style: { color: '#00CC66', fontWeight: 'bold', fontSize: '14px' } }, ['✓  Cuenta conectada']),
            View({ style: { color: '#555', fontSize: '12px', marginTop: '4px' } }, [email]),
          ]
        ),

        // ── Nickname ──────────────────────────────────────────────
        View(
          { style: { marginBottom: '12px' } },
          [
            View({ style: { color: '#00BFFF', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' } },
              ['🏆 Nickname (aparece en el ranking)']),
            TextInput({
              label: '',
              value: nickname,
              placeholder: 'ej: JuanNadador',
              style: { fontSize: '15px', borderRadius: '8px' },
              onChange: (val) => {
                settingsStorage.setItem('nickname', val.trim())
              },
            }),
          ]
        ),

        // ── Zepp Health credentials ────────────────────────────────
        View(
          { style: { marginBottom: '12px' } },
          [
            View({ style: { color: '#00BFFF', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' } },
              ['📧 Email de Zepp Health']),
            TextInput({
              label: '',
              value: email,
              placeholder: 'vos@email.com',
              style: { fontSize: '15px', borderRadius: '8px' },
              onChange: (val) => {
                settingsStorage.setItem('zeppEmail', val.trim())
              },
            }),
          ]
        ),

        View(
          { style: { marginBottom: '20px' } },
          [
            View({ style: { color: '#00BFFF', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' } },
              ['🔑 Contraseña']),
            TextInput({
              label: '',
              value: password,
              placeholder: '••••••••',
              style: { fontSize: '15px', borderRadius: '8px' },
              onChange: (val) => {
                settingsStorage.setItem('zeppPassword', val)
                // Clear cached token so next sync re-authenticates
                settingsStorage.removeItem('zeppToken')
                settingsStorage.removeItem('zeppTokenExpiry')
              },
            }),
          ]
        ),

        // ── Privacy notice ─────────────────────────────────────────
        View(
          {
            style: {
              background: '#001520',
              borderLeft: '3px solid #00BFFF',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '20px',
            }
          },
          [
            View({ style: { color: '#00BFFF', fontSize: '13px', fontWeight: 'bold' } }, ['🔒  Privacidad']),
            View(
              { style: { color: '#555', fontSize: '12px', marginTop: '6px', lineHeight: '1.4' } },
              ['Tus credenciales nunca salen de tu teléfono. Solo se usa el token de sesión para importar tus sesiones.']
            ),
          ]
        ),

        // ── Clear button ────────────────────────────────────────────
        isLinked && Button({
          label: 'Borrar credenciales',
          style: {
            fontSize: '14px',
            borderRadius: '20px',
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

        // ── Version ─────────────────────────────────────────────────
        View(
          { style: { textAlign: 'center', marginTop: '20px', color: '#333', fontSize: '11px' } },
          ['SwimRank v1.0.0  ·  Amazfit Active 2']
        ),
      ]
    )
  },
})
