import { messaging }        from '@zos/messaging'
import { settingsStorage } from '@zos/settings'
import { login, getSwimWorkouts } from './zepp-api.js'
import { processWorkouts }  from './process-workouts.js'
import { API_BASE, DISCIPLINES } from '../utils/constants.js'

function buf2json(buf) {
  const arr = new Uint8Array(buf)
  let str = ''
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i])
  return JSON.parse(str)
}

function json2buf(obj) {
  const str = JSON.stringify(obj)
  const arr = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i)
  return arr.buffer
}

function send(obj) {
  messaging.peerSocket.send(json2buf(obj))
}

async function fetchJson(url, opts = {}) {
  const res = await fetch({ url, ...opts })
  return typeof res.body === 'string' ? JSON.parse(res.body) : res.body
}

async function getOrRefreshToken() {
  const cached = settingsStorage.getItem('zeppToken')
  const expiry = settingsStorage.getItem('zeppTokenExpiry')
  if (cached && expiry && Date.now() < Number(expiry)) return cached

  const email    = settingsStorage.getItem('zeppEmail')
  const password = settingsStorage.getItem('zeppPassword')
  if (!email || !password) throw new Error('NO_CREDENTIALS')

  const token = await login(email, password)
  settingsStorage.setItem('zeppToken', token)
  settingsStorage.setItem('zeppTokenExpiry', String(Date.now() + 23 * 3600 * 1000))
  return token
}

// Map internal discipline IDs → backend discipline codes
const DISC_MAP = {
  '50':   'DIST_50',   '100':  'DIST_100',  '200':  'DIST_200',
  '500':  'DIST_500',  '1000': 'DIST_1000', '1500': 'DIST_1500',
  'maxt': 'LONGEST_TIME', 'maxd': 'LONGEST_DISTANCE',
}

async function syncWithBackend(deviceId, personalBests) {
  // Result: { [discId]: { top10: [...], myRank: {...} } }
  const result = {}

  for (const disc of DISCIPLINES) {
    const backendDisc = DISC_MAP[disc.id]
    if (!backendDisc) continue

    const best = personalBests[disc.id]?.[0]

    // 1. Upload personal best to backend (so this user appears in global rankings)
    if (best) {
      const nickname = settingsStorage.getItem('nickname') || 'Anónimo'
      try {
        await fetch({
          url: `${API_BASE}/records`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            nickname,
            discipline: backendDisc,
            value: best.value,
            recordedAt: best.recordedAt,
          }),
        })
      } catch (_) {}
    }

    // 2. Fetch global top 10 for this discipline
    let top10 = []
    try {
      const rankData = await fetchJson(`${API_BASE}/rankings/${backendDisc}`)
      top10 = (rankData.rankings ?? []).map(r => ({
        rank:      r.rank,
        deviceId:  r.deviceId,
        nickname:  r.nickname ?? null,
        value:     r.value,
        isYou:     r.deviceId === deviceId,
      }))
    } catch (_) {}

    // 3. Fetch user's personal rank position
    let myRank = null
    try {
      const myData = await fetchJson(`${API_BASE}/rank/${deviceId}/${backendDisc}`)
      if (myData.rank != null) {
        myRank = { rank: myData.rank, total: myData.total, value: myData.value }
      }
    } catch (_) {}

    result[disc.id] = { top10, myRank }
  }

  return result
}

SideService({
  onInit() {
    messaging.peerSocket.addListener('message', async (payload) => {
      try {
        const msg = buf2json(payload)
        if (msg.type !== 'SYNC_REQUEST') return

        const { deviceId } = msg

        // Get personal bests from Zepp Health
        const token        = await getOrRefreshToken()
        const workouts     = await getSwimWorkouts(token)
        const personalBests = processWorkouts(workouts)

        // Sync with backend → get global leaderboards
        const globalData = await syncWithBackend(deviceId, personalBests)

        // Persist to settingsStorage so the Settings App can display rankings
        settingsStorage.setItem('globalData', JSON.stringify(globalData))
        settingsStorage.setItem('lastSyncTime', String(Date.now()))

        send({ type: 'SYNC_RESPONSE', globalData, personalBests })
      } catch (err) {
        const isNoCreds = err.message === 'NO_CREDENTIALS'
        send({
          type: 'SYNC_ERROR',
          message: isNoCreds
            ? 'Configurá tu cuenta Zepp en Ajustes'
            : 'Error al sincronizar',
        })
      }
    })
  },

  onDestroy() {
    messaging.peerSocket.removeAllListeners('message')
  },
})
