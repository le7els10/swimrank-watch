import { createWidget, widget, align, prop } from '@zos/ui'
import { push }        from '@zos/router'
import { localStorage } from '@zos/storage'
import { getApp }      from '@zos/app'
let getText = (k) => k  // fallback if i18n unavailable
try { getText = require('@zos/i18n').getText ?? getText } catch (_) {}
import { SCREEN_W, SAFE_X, SAFE_W, C, DISCIPLINES } from '../../utils/constants.js'
import { json2ab, ab2json } from '../../utils/format.js'

let _peerSocket = null
try {
  const mod = require('@zos/messaging')
  _peerSocket = mod.peerSocket ?? mod.messaging?.peerSocket ?? null
} catch (_) {}

const CX = SCREEN_W / 2   // 233
const CARD_H  = 64
const CARD_GAP = 8
const LIST_Y  = 102

Page({
  onInit() {
    if (_peerSocket) {
      try {
        _peerSocket.addListener('message', (buf) => {
          try {
            const msg = ab2json(buf)
            if (msg.type === 'SYNC_RESPONSE') {
              // globalData: { [discId]: { top10: [...], myRank: {...} } }
              localStorage.setItem('globalData', JSON.stringify(msg.globalData))
            }
          } catch (_) {}
        })
      } catch (_) {}
    }
  },

  build() {
    // ── Fondo ──────────────────────────────────────────────────────
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: SCREEN_W, h: SCREEN_W, color: C.bg })

    // ── Wordmark: SWIM (cyan) + RANK (white) ───────────────────────
    const wY = 20
    createWidget(widget.TEXT, {
      x: CX - 182, y: wY, w: 178, h: 42,
      text: getText('swim'),
      text_size: 34,
      align_h: align.RIGHT,
      color: C.cyan,
    })
    createWidget(widget.TEXT, {
      x: CX + 4, y: wY, w: 178, h: 42,
      text: getText('rank'),
      text_size: 34,
      align_h: align.LEFT,
      color: C.white,
    })

    // ── Chip "#47 MUNDIAL" ─────────────────────────────────────────
    const chipW = 148, chipH = 26
    const chipX = CX - chipW / 2
    createWidget(widget.FILL_RECT, {
      x: chipX, y: 66, w: chipW, h: chipH, radius: 13,
      color: 0x1A1100, // dark gold bg
    })
    createWidget(widget.TEXT, {
      x: chipX, y: 70, w: chipW, h: 18,
      text: getText('mundial_chip'),
      text_size: 14,
      align_h: align.CENTER_H,
      color: C.gold,
    })

    // ── Lista de disciplinas ───────────────────────────────────────
    DISCIPLINES.forEach((disc, i) => {
      const y = LIST_Y + i * (CARD_H + CARD_GAP)

      const nav = () => {
        localStorage.setItem('selectedDiscipline', disc.id)
        push({ url: 'page/rankings/index' })
      }

      // BUTTON cubre el card completo — fondo unificado + click en zonas vacías
      createWidget(widget.BUTTON, {
        x: SAFE_X, y, w: SAFE_W, h: CARD_H,
        text: '', radius: 12,
        normal_color: C.card, press_color: C.cardPress,
        click_func: nav,
      })

      // Todos los TEXT con su propio click_func → no bloquean el BUTTON
      createWidget(widget.TEXT, {
        x: SAFE_X + 6, y: y + 10, w: 40, h: 44,
        text: disc.iconChar, text_size: 26,
        align_h: align.CENTER_H, color: C.cyan,
        click_func: nav,
      })
      createWidget(widget.TEXT, {
        x: SAFE_X + 52, y: y + 8, w: 234, h: 30,
        text: getText(disc.labelKey), text_size: 26, color: C.white,
        click_func: nav,
      })
      createWidget(widget.TEXT, {
        x: SAFE_X + 52, y: y + 37, w: 234, h: 22,
        text: getText('mejor') + ' · ' + disc.best, text_size: 18, color: C.ink60,
        click_func: nav,
      })
      createWidget(widget.TEXT, {
        x: SAFE_X + SAFE_W - 30, y: y + 16, w: 26, h: 32,
        text: '›', text_size: 28, color: C.ink40,
        click_func: nav,
      })
    })

    // ── Botón Sincronizar ──────────────────────────────────────────
    const btnY = LIST_Y + DISCIPLINES.length * (CARD_H + CARD_GAP) + 16

    createWidget(widget.BUTTON, {
      x: CX - 72, y: btnY, w: 144, h: 56,
      text: getText('sincronizar'),
      text_size: 16,
      radius: 28,
      normal_color: 0x0A3F6B,
      press_color:  0x052A48,
      text_color:   C.cyan,
      click_func:   this._onSync.bind(this),
    })

    this._statusWidget = createWidget(widget.TEXT, {
      x: 0, y: btnY + 62, w: SCREEN_W, h: 28,
      text: '',
      text_size: 14,
      align_h: align.CENTER_H,
      color: C.ink60,
    })
  },

  _onSync() {
    const deviceId = getApp()?.globalData?.deviceId ?? 'unknown'
    if (this._statusWidget) {
      this._statusWidget.setProperty(prop.MORE, { text: getText('conectando') })
    }

    if (_peerSocket) {
      try {
        _peerSocket.send(json2ab({ type: 'SYNC_REQUEST', deviceId }))
      } catch (_) {}
    }

    // Navigate to sync animation screen
    push({ url: 'page/sync/index' })
  },

  onDestroy() {
    if (_peerSocket) {
      try { _peerSocket.removeAllListeners?.('message') } catch (_) {}
    }
  },
})
