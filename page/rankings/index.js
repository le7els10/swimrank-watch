import { createWidget, widget, align, prop } from '@zos/ui'
import { push, back } from '@zos/router'
import { getText } from '@zos/i18n'
import { localStorage } from '@zos/storage'
import { SCREEN_W, SAFE_X, SAFE_W, C, DISCIPLINE_MAP, rankColor } from '../../utils/constants.js'

const CX     = SCREEN_W / 2
const ROW_H  = 56
const ROW_G  = 8
const LIST_Y = 100

// Demo fallback: simulate global leaderboard with mix of users
const DEMO_GLOBAL = {
  '100': {
    top10: [
      { rank: 1, deviceId: 'NX-7741', nickname: 'SharkAUS',   value: 58.2,  isYou: false },
      { rank: 2, deviceId: 'QZ-1180', nickname: 'MichaelP',   value: 59.0,  isYou: false },
      { rank: 3, deviceId: 'MK-4402', nickname: 'KazuSwim',   value: 60.4,  isYou: false },
      { rank: 4, deviceId: 'VP-2290', nickname: 'LagunaCOL',  value: 64.1,  isYou: false },
      { rank: 5, deviceId: 'demo-me', nickname: 'Vos',        value: 68.3,  isYou: true  },
    ],
    myRank: { rank: 5, total: 1203, value: 68.3 },
  },
}

function fmtTime(seconds, discId) {
  if (discId === 'maxd') return `${Math.round(seconds)}m`
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(1).padStart(4, '0')
  return m > 0 ? `${m}:${s}` : `${seconds.toFixed(1)}s`
}

function shortId(deviceId) {
  if (!deviceId) return '---'
  // Show last 6 chars of deviceId for anonymity
  return deviceId.slice(-6).toUpperCase()
}

Page({
  onInit() {
    this.discId = localStorage.getItem('selectedDiscipline') || '100'
    this.disc   = DISCIPLINE_MAP[this.discId] ?? DISCIPLINE_MAP['100']

    // Load global data synced from backend
    const raw = localStorage.getItem('globalData')
    const gd  = raw ? JSON.parse(raw) : null
    const discData = gd?.[this.discId] ?? DEMO_GLOBAL[this.discId] ?? null

    this.top10  = discData?.top10  ?? []
    this.myRank = discData?.myRank ?? null
  },

  build() {
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: SCREEN_W, h: SCREEN_W, color: C.bg })

    // ── Header ──────────────────────────────────────────────────────
    createWidget(widget.BUTTON, {
      x: SAFE_X, y: 14, w: 44, h: 44,
      text: '‹', text_size: 34, radius: 22,
      normal_color: C.bg, press_color: C.card,
      text_color: C.cyan, click_func: () => back(),
    })
    createWidget(widget.TEXT, {
      x: SAFE_X + 48, y: 16, w: SAFE_W - 96, h: 32,
      text: getText(this.disc?.labelKey ?? 'disc_100').toUpperCase(),
      text_size: 26, align_h: align.CENTER_H, color: C.white,
    })
    createWidget(widget.TEXT, {
      x: 0, y: 50, w: SCREEN_W, h: 22,
      text: getText('ranking_global'),
      text_size: 15, align_h: align.CENTER_H, color: C.cyan,
    })
    createWidget(widget.FILL_RECT, {
      x: SAFE_X, y: 72, w: SAFE_W, h: 1, color: C.line,
    })

    // ── Estado vacío ───────────────────────────────────────────────
    if (!this.top10 || this.top10.length === 0) {
      createWidget(widget.TEXT, {
        x: 0, y: 180, w: SCREEN_W, h: 80,
        text: getText('sin_datos'),
        text_size: 20, align_h: align.CENTER_H, color: C.ink60,
      })
      return
    }

    // ── Leaderboard global — layout: [#] [nickname .......... tiempo] ──
    this.top10.forEach((entry, i) => {
      const y        = LIST_Y + i * (ROW_H + ROW_G)
      const rColor   = rankColor(entry.rank)
      const isPodium = entry.rank <= 3
      const isMe     = entry.isYou

      // Row background
      createWidget(widget.FILL_RECT, {
        x: SAFE_X, y, w: SAFE_W, h: ROW_H,
        radius: 10,
        color: isMe ? 0x00243C : isPodium ? _podiumBg(entry.rank) : 0x0A0A0A,
      })

      // Left accent bar
      createWidget(widget.FILL_RECT, {
        x: SAFE_X, y: y + 4, w: 4, h: ROW_H - 8,
        color: isMe ? C.cyan : isPodium ? rColor : C.line,
        radius: 2,
      })

      // Crown for #1 (above the row)
      if (entry.rank === 1) {
        createWidget(widget.TEXT, {
          x: SAFE_X + 4, y: y - 11, w: 28, h: 14,
          text: '♛', text_size: 11, align_h: align.CENTER_H, color: C.gold,
        })
      }

      // Rank number — left column (38px wide)
      createWidget(widget.TEXT, {
        x: SAFE_X + 5, y: y + 13, w: 34, h: 30,
        text: `${entry.rank}`,
        text_size: isPodium ? 24 : 20,
        align_h: align.CENTER_H,
        color: isMe ? C.cyan : isPodium ? rColor : C.ink40,
      })

      // Nickname — center (fills remaining space minus time)
      const nick = isMe
        ? getText('yo')
        : (entry.nickname && entry.nickname !== 'Anónimo' ? entry.nickname : shortId(entry.deviceId))
      const timeStr  = fmtTime(entry.value, this.discId)
      const timeW    = 90
      const nickX    = SAFE_X + 44
      const nickW    = SAFE_W - 44 - timeW - 4

      createWidget(widget.TEXT, {
        x: nickX, y: y + 13, w: nickW, h: 30,
        text: nick,
        text_size: isPodium ? 22 : 20,
        color: isMe ? C.cyan : C.white,
      })

      // Time — right-aligned
      createWidget(widget.TEXT, {
        x: SAFE_X + SAFE_W - timeW, y: y + 13, w: timeW, h: 30,
        text: timeStr,
        text_size: isPodium ? 22 : 20,
        align_h: align.RIGHT,
        color: isPodium ? rColor : isMe ? C.cyan : C.ink60,
      })

      // Progress bar — thin strip at bottom of row
      const maxVal = this.top10[0]?.value ?? entry.value
      const barPct = maxVal > 0 ? Math.round((maxVal / entry.value) * (SAFE_W - 12)) : 10
      createWidget(widget.FILL_RECT, {
        x: SAFE_X + 6, y: y + ROW_H - 5, w: SAFE_W - 12, h: 3,
        color: 0x111111, radius: 2,
      })
      createWidget(widget.FILL_RECT, {
        x: SAFE_X + 6, y: y + ROW_H - 5,
        w: Math.min(barPct, SAFE_W - 12), h: 3,
        color: isMe ? C.cyan : isPodium ? rColor : C.pool,
        radius: 2,
      })
    })

    // ── Posición del usuario si NO está en el top 10 ───────────────
    const inTop10 = this.top10.some(r => r.isYou)
    if (!inTop10 && this.myRank) {
      const y = LIST_Y + this.top10.length * (ROW_H + ROW_G) + 8

      createWidget(widget.FILL_RECT, {
        x: SAFE_X, y, w: SAFE_W, h: ROW_H,
        radius: 10, color: 0x00243C,
      })
      createWidget(widget.TEXT, {
        x: SAFE_X + 8, y: y + 6, w: SAFE_W - 16, h: 22,
        text: `${getText('tu_posicion')}: #${this.myRank.rank} ${getText('de')} ${this.myRank.total}`,
        text_size: 17, color: C.cyan,
      })
      createWidget(widget.TEXT, {
        x: SAFE_X + 8, y: y + 28, w: SAFE_W - 16, h: 24,
        text: fmtTime(this.myRank.value, this.discId),
        text_size: 22, color: C.white,
      })
    }

    // ── Botón ver ranking mundial completo ─────────────────────────
    const hasData = this.top10.length > 0
    if (hasData) {
      const btnY = LIST_Y + (this.top10.length + ((!inTop10 && this.myRank) ? 1 : 0)) * (ROW_H + ROW_G) + 16
      createWidget(widget.BUTTON, {
        x: CX - 110, y: btnY, w: 220, h: 50,
        text: getText('ver_mas'),
        text_size: 19, radius: 25,
        normal_color: 0x051D35, press_color: 0x0A2F50,
        text_color: C.cyan,
        click_func: () => push({ url: 'page/world-rank/index' }),
      })
    }
  },
})

function _podiumBg(rank) {
  if (rank === 1) return 0x1A1000
  if (rank === 2) return 0x0F1318
  return 0x140A00
}
