// Zepp Health unofficial API
// Endpoints reverse-engineered from the Zepp app traffic.
// These can change — check https://github.com/zepp-health/zeppos-docs or community resources if auth breaks.

const BASE_USER  = 'https://api-user.huami.com'
const BASE_MIFIT = 'https://api-mifit.huami.com'

// Sport type codes for Zepp Health
const POOL_SWIM_TYPE = 31

async function fetchJson(opts) {
  const res = await fetch(opts)
  return typeof res.body === 'string' ? JSON.parse(res.body) : res.body
}

export async function login(email, password) {
  const data = await fetchJson({
    url: `${BASE_USER}/registrations/${encodeURIComponent(email)}/tokens`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password,
      client_id: 'HuaMi',
      grant_type: 'password',
      country_code: 'CN',
    }),
  })

  if (!data?.token_info?.app_token) {
    throw new Error('Login failed: ' + JSON.stringify(data))
  }
  return data.token_info.app_token
}

export async function getSwimWorkouts(appToken, days = 180) {
  const now   = new Date()
  const from  = new Date(now - days * 86400000)
  const toStr = now.toISOString().slice(0, 10)
  const frStr = from.toISOString().slice(0, 10)

  const data = await fetchJson({
    url: `${BASE_MIFIT}/v1/sport/b_user_workout_history?from_date=${frStr}&to_date=${toStr}&limit=500`,
    method: 'GET',
    headers: { apptoken: appToken },
  })

  const workouts = data?.data ?? []
  return workouts.filter(w => w.sport_type === POOL_SWIM_TYPE)
}
