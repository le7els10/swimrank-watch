import { createWidget, widget, align, prop } from '@zos/ui'
import { replace } from '@zos/router'
import { getText } from '@zos/i18n'
import { SCREEN_W, C } from '../../utils/constants.js'

const CX = SCREEN_W / 2
const CY = SCREEN_W / 2
// ARC ring: bounding box fills safe circle
const ARC_X = 23, ARC_Y = 23, ARC_SZ = 420

Page({
  onInit() {
    this._progress = 0
    this._timer = null
  },

  build() {
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: SCREEN_W, h: SCREEN_W, color: C.bg })

    // ── Background glow circle ────────────────────────────────────
    createWidget(widget.CIRCLE, {
      center_x: CX, center_y: CY,
      radius: 190, color: 0x020C1C,
    })

    // ── Progress ring — background track ─────────────────────────
    createWidget(widget.ARC, {
      x: ARC_X, y: ARC_Y, w: ARC_SZ, h: ARC_SZ,
      start_angle: -90, end_angle: 270,
      color: 0x0E1A26,
      line_width: 8,
    })

    // ── Progress ring — foreground (will be updated) ──────────────
    this._arc = createWidget(widget.ARC, {
      x: ARC_X, y: ARC_Y, w: ARC_SZ, h: ARC_SZ,
      start_angle: -90, end_angle: -89, // tiny initial arc
      color: C.cyan,
      line_width: 8,
    })

    // ── Wave layers (two colored horizontal bands, animated) ──────
    // Simplified: two static filled arcs at the bottom as "water"
    this._wave1 = createWidget(widget.FILL_RECT, {
      x: 0, y: Math.round(CY + 60), w: SCREEN_W, h: 100,
      color: 0x0E2D46,
    })
    this._wave2 = createWidget(widget.FILL_RECT, {
      x: 0, y: Math.round(CY + 80), w: SCREEN_W, h: 80,
      color: 0x001525,
    })

    // ── Percentage text ───────────────────────────────────────────
    this._pctText = createWidget(widget.TEXT, {
      x: 0, y: CY - 48, w: SCREEN_W, h: 72,
      text: '0%',
      text_size: 58,
      align_h: align.CENTER_H,
      color: C.white,
    })

    // ── Status text ───────────────────────────────────────────────
    this._statusText = createWidget(widget.TEXT, {
      x: 0, y: CY + 28, w: SCREEN_W, h: 24,
      text: getText('importando'),
      text_size: 16,
      align_h: align.CENTER_H,
      color: C.ink60,
    })

    // ── Cancel button ─────────────────────────────────────────────
    createWidget(widget.BUTTON, {
      x: CX - 50, y: CY + 68, w: 100, h: 36,
      text: getText('cancelar'),
      text_size: 15,
      radius: 18,
      normal_color: 0x111111,
      press_color:  0x222222,
      text_color:   C.ink60,
      click_func:   this._onCancel.bind(this),
    })

    // ── Start progress animation ──────────────────────────────────
    this._startProgress()
  },

  _startProgress() {
    this._timer = setInterval(() => {
      const delta = 2 + Math.random() * 3.5
      this._progress = Math.min(this._progress + delta, 100)
      const p = Math.round(this._progress)
      const endAngle = -90 + (p / 100) * 360

      if (this._arc) {
        this._arc.setProperty(prop.MORE, { end_angle: endAngle })
      }
      if (this._pctText) {
        this._pctText.setProperty(prop.MORE, { text: `${p}%` })
      }

      // Animate wave rising with progress
      if (this._wave1 && this._wave2) {
        const waveY = CY + 60 - Math.round(this._progress * 0.3)
        this._wave1.setProperty(prop.MORE, { y: waveY })
        this._wave2.setProperty(prop.MORE, { y: waveY + 20 })
      }

      if (this._progress >= 100) {
        clearInterval(this._timer)
        this._timer = null
        if (this._statusText) {
          this._statusText.setProperty(prop.MORE, { text: getText('sincronizado') })
        }
        // Navigate to record screen after short pause
        setTimeout(() => replace({ url: 'page/record/index' }), 650)
      }
    }, 120)
  },

  _onCancel() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    replace({ url: 'page/home/index' })
  },

  onDestroy() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },
})
